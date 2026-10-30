"""Runs when a new issue is opened (triggered by .github/workflows/new-issue.yml).

GitHub Actions writes the full event payload to a JSON file whose path is in
the GITHUB_EVENT_PATH environment variable. This script reads it, prints some
details, posts a welcome comment, adds a label if the title mentions "bug",
and, for namespace requests, appends a row to a CSV file in the repo.

Uses only the standard library, so no pip install step is needed.
"""

import base64
import csv
import io
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime

API_URL = "https://api.github.com"

# Path of the CSV file in the repo, set in the workflow's env block
OUTPUT_CSV_FILE = os.environ.get("OUTPUT_CSV_FILE")

# Orphan branch containing the CSV file
STATS_FILE_BRANCH = os.environ.get("STATS_FILE_BRANCH")

# Matches "namespace" followed by an optional ":" or "=" and then the name,
# which may be wrapped in single quotes, backticks or square brackets, e.g.
#   "New namespace: payments-dev"   "Request namespace 'team-a'"
#   "namespace [my.ext]"            "namespace `foo`"
# Only one of the groups matches; extract_namespace picks whichever did.
NAMESPACE_PATTERN = re.compile(
    r"\bnamespace\b\s*[:=]?\s*"
    r"(?:'\s*([^']+?)\s*'"                     # 'name'
    r"|`+\s*([^`]+?)\s*`+"                     # `name` or ``name``
    r"|\[\s*([^\]]+?)\s*\]"                    # [name]
    r"|[\"']?([A-Za-z0-9][A-Za-z0-9._\-]*))",  # bare name, optionally quoted
    re.IGNORECASE,
)

# Values that mean the author didn't fill the field in: the template's
# "[name]" placeholder, and the text GitHub issue forms use for empty fields
PLACEHOLDER_NAMESPACES = {"name", "_no response_", "no response"}

# A line in the description that labels the namespace field, such as
# "### Namespace", "**Namespace**" or "Namespace:". Anything after it on the
# same line is captured, for descriptions written as "Namespace: foo".
BODY_NAMESPACE_HEADING = re.compile(
    r"^\s*(?:#{1,6}\s*)?(?:\*\*)?namespace(?:\*\*)?\s*:?\s*(.*)$", re.IGNORECASE
)


def github_request(method, path, token, body=None):
    """Send an authenticated request to the GitHub REST API."""
    data = json.dumps(body).encode() if body is not None else None
    print(f"URL: {API_URL}{path}")
    req = urllib.request.Request(
        f"{API_URL}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def extract_namespace(title):
    """Return the namespace name from the issue title, or None if not found."""
    match = NAMESPACE_PATTERN.search(title)
    if not match:
        return None
    # The delimiters sit outside the groups, so the result has them removed
    value = next((group for group in match.groups() if group), None)
    return clean_namespace(value) if value else None


def clean_namespace(value):
    """Strip delimiters from a raw value; return None if it's empty or a placeholder."""
    value = value.strip().strip("`'\"[]").strip()
    if not value or value.lower() in PLACEHOLDER_NAMESPACES:
        return None
    # Namespaces don't contain spaces, so ignore anything after the first word
    return value.split()[0]


def extract_namespace_from_body(body):
    """Return the value under the "Namespace" heading in the description, or None."""
    lines = body.splitlines()
    for i, line in enumerate(lines):
        match = BODY_NAMESPACE_HEADING.match(line)
        if not match:
            continue
        # Value on the same line as the heading, e.g. "Namespace: foo"
        if match.group(1).strip():
            return clean_namespace(match.group(1))
        # Otherwise the first non-blank line after it, unless that's another heading
        for following in lines[i + 1:]:
            if not following.strip():
                continue
            if following.lstrip().startswith("#"):
                return None
            return clean_namespace(following)
    return None


def is_namespace_a_vs_code_publisher(vs_code_publisher):
    """Return True if the VS Code Marketplace has a publisher page for this name."""
    url = (
        "https://marketplace.visualstudio.com/publishers/"
        f"{urllib.parse.quote(vs_code_publisher)}"
    )
    # Some sites reject urllib's default User-Agent, so send a browser-like one
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        # urlopen raises HTTPError for 4xx/5xx, like requests' raise_for_status()
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.status == 200
    except urllib.error.URLError as e:  # HTTPError is a subclass of URLError
        print(f"Request failed: {e}")
        return False

def does_vs_code_publisher_have_extensions(vs_code_publisher):
    """Return True if the VS Code publisher has published extensions."""
    url = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
    payload = {
        "filters": [{
            "criteria": [
                # 8 = InstallationTarget: only VS Code extensions
                {"filterType": 8, "value": "Microsoft.VisualStudio.Code"},
                # 18 = PublisherName
                {"filterType": 18, "value": vs_code_publisher},
                # 12 = ExcludeWithFlags; 4096 = Unpublished
                {"filterType": 12, "value": "4096"},
            ],
            "pageNumber": 1,
            "pageSize": 1,  # we only need to know if at least one exists
        }],
        "flags": 0,  # minimal response, no versions/files/stats
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json;api-version=7.2-preview.1",
            "User-Agent": "Mozilla/5.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.load(response)
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"Request failed: {e}")
        return False

    results = data.get("results") or [{}]
    extensions = results[0].get("extensions", [])

    # Guard against loose matching: confirm the publisher name really matches
    target = vs_code_publisher.lower()
    return any(
        ext.get("publisher", {}).get("publisherName", "").lower() == target
        for ext in extensions
    )

def append_csv_row(repo, branch, path, row, token, number, attempts=3):
    """Append one row to a CSV file in the repo and commit it via the API.

    Reads the file's current contents and SHA, adds the row, and writes it
    back. If another commit changed the file in between, GitHub rejects the
    write with 409 Conflict, so the read-modify-write is retried.
    """
    encoded_path = urllib.parse.quote(path)
    for attempt in range(1, attempts + 1):
        current = github_request(
            "GET", f"/repos/{repo}/contents/{encoded_path}?ref={branch}", token
        )
        text = base64.b64decode(current["content"]).decode("utf-8")
        if text and not text.endswith("\n"):
            text += "\n"

        # csv.writer handles quoting if a value contains a comma or quote
        buffer = io.StringIO()
        csv.writer(buffer, lineterminator="\n").writerow(row)
        text += buffer.getvalue()

        try:
            github_request(
                "PUT",
                f"/repos/{repo}/contents/{encoded_path}",
                token,
                {
                    "message": f"Add namespace request from issue #{number}",
                    "content": base64.b64encode(text.encode("utf-8")).decode(),
                    "sha": current["sha"],
                    "branch": branch,
                },
            )
            return
        except urllib.error.HTTPError as err:
            if err.code == 409 and attempt < attempts:
                print(f"File changed during update, retrying ({attempt}/{attempts})...")
                time.sleep(2)
                continue
            raise


def main():
    token = os.environ["GITHUB_TOKEN"]
    repo = os.environ["GITHUB_REPOSITORY"]  # e.g. "owner/repo", set automatically

    with open(os.environ["GITHUB_EVENT_PATH"]) as f:
        event = json.load(f)

    issue = event["issue"]
    number = issue["number"]
    title = issue["title"]
    author = issue["user"]["login"]
    body = issue.get("body") or ""

    print(f"New issue #{number} by @{author}: {title}")
    print(f"Body length: {len(body)} characters")

    # Each label in the payload is a dict; the display name is under "name"
    labels = [label["name"] for label in issue.get("labels", [])]
    print(f"Labels: {', '.join(labels) if labels else '(none)'}")

    # Record namespace requests in the CSV file
    has_namespace_label = any(name.lower() == "namespace" for name in labels)
    if "namespace" in title.lower() or has_namespace_label:
        namespace = extract_namespace(title)
        if namespace is None:
            # Title had no name, or only the template's "[name]" placeholder
            print("No namespace name in the title; checking the description.")
            namespace = extract_namespace_from_body(body)
            if namespace:
                print(f"Found namespace '{namespace}' in the description.")
    else:
        namespace = extract_namespace_from_body(body)
        if namespace:
            print(f"Found namespace '{namespace}' in the description.")

    if namespace is None:
        # Still record the request, leaving the namespace and publisher blank
        print("No namespace name found; leaving those columns blank.")
        namespace_col = ""
        publisher_col = ""
        vs_code_extensions_col = ""
    else:
        is_publisher = is_namespace_a_vs_code_publisher(namespace)
        print(f"'{namespace}' is a VS Code Marketplace publisher: {is_publisher}")
        namespace_col = namespace
        # str() writes the boolean as "True" or "False" in the CSV
        publisher_col = str(is_publisher)
        if is_publisher:
            vs_code_extensions_col = str(does_vs_code_publisher_have_extensions(namespace))
        else:
            vs_code_extensions_col = "False"

    # created_at is ISO 8601 in UTC, e.g. "2026-10-15T14:03:22Z"
    created = datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00"))
    row = [
        created.strftime("%m/%d/%Y"),
        author,
        namespace_col,
        publisher_col,
        vs_code_extensions_col,
        number,
    ]
    append_csv_row(repo, STATS_FILE_BRANCH, OUTPUT_CSV_FILE, row, token, number)
    print(f"Appended {row} to {OUTPUT_CSV_FILE} on {STATS_FILE_BRANCH}.")


if __name__ == "__main__":
    main()
