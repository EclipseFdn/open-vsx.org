"""  
Script to collect activity stats, used by Jupyter Notebooks. Requires an access token 
from https://open-vsx.org/user-settings/tokens with admin access.  The following use 
web auth, not the API token:
   - https://open-vsx.org/admin/log
   - https://open-vsx.org/admin/stats

Currently there is a bug in stats that requires a token query paramater, the value of 
which is ignored.
"""

import requests
from requests.auth import HTTPBasicAuth
from datetime import date
from dateutil.relativedelta import relativedelta
import pandas as pd
import os
import json
from json import JSONDecodeError

API_ENDPOINT = os.getenv('API_ENDPOINT')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

HEADERS = ['year', 'month', 'extensions', 'downloads', 'downloadsTotal', 'publishers', 'averageReviewsPerExtension', 'namespaceOwners']

def get_available_reports():
    url = '%sadmin/reports?token=%s' % (API_ENDPOINT, ACCESS_TOKEN)
    response = requests.get(url)
    results = response.json()
    return results

def schedule_report(year, month):
    url = '%sadmin/report/schedule?token=%s' % (API_ENDPOINT, ACCESS_TOKEN)
    headers = {"Content-Type": "application/json"}
    payload = {
        'year': year,
        'month': month
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.status_code


def get_publishing_data(starting_year, starting_month):
    start_date = date(starting_year, starting_month, 1)
    today = date.today()
    data = {}
    for header in HEADERS:
        data[header] = []
    while start_date.year < today.year or (start_date.year == today.year and start_date.month < today.month):
        url = '%sadmin/report?year=%s&month=%s&token=%s' % (API_ENDPOINT, start_date.year, start_date.month, ACCESS_TOKEN)
        response = requests.get(url)
        if response.status_code == 200:
            try:
                json_results = response.json()
                for col in HEADERS:
                    data[col].append(json_results[col])
                print("processed results for %s-%s" % (start_date.year, start_date.month))
            except JSONDecodeError:
                json_results = None
                print("Error decoding JSON results for %s" % url)
        else:
            print("%s error processing results for %s" % (response.status_code, url))
        start_date = start_date + relativedelta(months=1)

    df = pd.DataFrame(data,columns=HEADERS)
    return df

def process_most_active_data(most_active):
    resulting_dfs = {}
    for key in most_active.keys():
        if key == 'dates':
            dates = most_active['dates']
        else:
            data = {'dates': dates}
            for entry in most_active[key]['unique']:
                data[entry] = [None] * len(most_active['dates'])
            for i in range(len(dates)):
                date = dates[i]
                for entry in most_active[key][date]:
                    item = list(entry.values())[0]
                    value = list(entry.values())[1]
                    data[item][i] = value
            df = pd.DataFrame(data, columns=most_active[key]['unique'])
            df['date'] = dates
            resulting_dfs[key] = df
    return resulting_dfs

def most_active_data_append_unique(most_active, json_results, top_prop, key):
    for item in json_results[top_prop]:
        if item[key] not in most_active[top_prop]['unique']:
            most_active[top_prop]['unique'].append(item[key])

def extract_most_active_data_from_json(most_active, json_results, year, month):
    top_publishers = 'topMostActivePublishingUsers'
    top_extensions = 'topNamespaceExtensions'
    top_extension_versions = 'topNamespaceExtensionVersions'
    top_downloads = 'topMostDownloadedExtensions'

    no_data = True
    top_props = [top_publishers, top_extensions, top_extension_versions, top_downloads]
    for top_prop in top_props:
        if len(json_results[top_prop]) > 0:
            no_data = False
            break

    if no_data:
        return

    year_month = '%s/%s' % (month, str(year)[2:])
    most_active['dates'].append(year_month)

    most_active[top_publishers][year_month] = json_results[top_publishers]
    most_active_data_append_unique(most_active, json_results, top_publishers, 'userLoginName')

    most_active[top_extensions][year_month] = json_results[top_extensions]
    most_active_data_append_unique(most_active, json_results, top_extensions, 'namespace')

    most_active[top_extension_versions][year_month] = json_results[top_extension_versions]
    most_active_data_append_unique(most_active, json_results, top_extension_versions, 'namespace')

    most_active[top_downloads][year_month] = json_results[top_downloads]
    most_active_data_append_unique(most_active, json_results, top_downloads, 'extensionIdentifier')

def get_most_active_data(starting_year, starting_month):
    most_active = {
        'dates': [],
        'topMostActivePublishingUsers': {
            'unique': []
        },
        'topNamespaceExtensions': {
            'unique': []
        },
        'topNamespaceExtensionVersions': {
            'unique': []
        },
        'topMostDownloadedExtensions': {
            'unique': []
        }
    }

    today = date.today()
    start_date = date(starting_year, starting_month, 1)
    while start_date.year < today.year or (start_date.year == today.year and start_date.month < today.month):
        url = '%sadmin/report?year=%s&month=%s&token=%s' % (API_ENDPOINT, start_date.year, start_date.month, ACCESS_TOKEN)
        response = requests.get(url)
        if response.status_code == 200:
            try:
                extract_most_active_data_from_json(most_active, response.json(), start_date.year, start_date.month)                
            except JSONDecodeError:
                print("Error decoding JSON results for %s" % url)
        else:
            print("%s error processing results for %s" % (response.status_code, url))
        start_date = start_date + relativedelta(months=1)
    
    return process_most_active_data(most_active)

if __name__ == '__main__':
    reports = get_available_reports()
    starting_year = os.getenv('STARTING_YEAR', None)
    starting_month = os.getenv('STARTING_MONTH', None)
    if starting_year is None or starting_month is None:
        year = list(reports.keys())[0]
        starting_year = int(year)
        starting_month = int(reports[year][0])
    else:
        starting_year = int(starting_year)
        starting_month = int(starting_month)

    most_active_dfs = get_most_active_data(starting_year, starting_month)
    for key in most_active_dfs:
        print(key)
        dates = most_active_dfs[key]['date']
        print(most_active_dfs[key].to_string())

