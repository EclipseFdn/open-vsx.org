""" 
Script to collect metadata on all extensions published on VS Code Marketplace. Outputs 
both a JSON and a CSV file. Note, this relies on interfaces that are not fully documented 
and are subject to change. 
"""
import os
import requests
import json
import traceback
from datetime import datetime

def get_ms_info(ext):
    extension_name = ext['extensionName']
    publisher_name = ext['publisher']['publisherName']
    display_name = ext['displayName'].replace(',', ' ')
    latest_version = ext['versions'][0]['version']
    last_updated = ext['versions'][0]['lastUpdated']

    try:
        repo = [prop for prop in ext['versions'][0]['properties'] if prop['key'] == 'Microsoft.VisualStudio.Services.Links.Source'][0]['value']
    except Exception:
        repo = None

    try:
        pricing = [prop for prop in ext['versions'][0]['properties'] if prop['key'] == 'Microsoft.VisualStudio.Services.Content.Pricing'][0]['value']
    except Exception:
        pricing = None
    
    return extension_name, publisher_name, display_name, latest_version, last_updated, repo, pricing

def convert_date_str(input_str):
    date_str = input_str[0:input_str.find('T')]
    date = datetime.strptime(date_str, '%Y-%m-%d')
    return_str = date.strftime("%-m/%-d/%Y")
    return return_str

if __name__ == '__main__':
    try:
        CSV_FILE_NAME = 'all_vs_extensions.csv'
        JSON_FILE_NAME = 'all_vs_extensions.json'
        MS_API_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery'
        MS_HEADERS = {
            'content-type': 'application/json',
            'accept': 'application/json;api-version=3.0-preview.1',
            'accept-encoding': 'gzip'
        }
        API_ENDPOINT = os.environ['API_ENDPOINT']
        VSX_API = '%sapi' % API_ENDPOINT
        
        # Looks like 1000 is the max page size
        get_all_extensions_payload = {
                "assetTypes": [
                    "Microsoft.VisualStudio.Services.Icons.Default",
                    "Microsoft.VisualStudio.Services.Icons.Branding",
                    "Microsoft.VisualStudio.Services.Icons.Small"
                ],
                "filters": [
                    {
                    "criteria": [
                        {
                        "filterType": 8,
                        "value": "Microsoft.VisualStudio.Code"
                        },
                        {
                        "filterType": 10,
                        "value": "target:\"Microsoft.VisualStudio.Code\" "
                        },
                        {
                        "filterType": 12,
                        "value": "37888"
                        }
                    ],
                    "direction": 2,
                    "pageSize": 1000,
                    "pageNumber": 1,
                    "sortBy": 4,
                    "sortOrder": 0,
                    "pagingToken": None
                    }
                ],
                "flags": 870
            }
        all_extensions = []
        total_all_versions = 0
        while True:
            response = requests.post(MS_API_URL, headers=MS_HEADERS, data=json.dumps(get_all_extensions_payload))
            if response.status_code != 200:
                print('HTTP %s error' % response.status_code)
                break
            else:
                vsx_results = response.json()
                extensions = vsx_results['results'][0]['extensions']
                all_extensions = all_extensions + extensions
                for extension in extensions:
                    versions = extension['versions']
                    total_all_versions += len(versions)
                total = vsx_results['results'][0]['resultMetadata'][0]['metadataItems'][0]['count']
                print('Retrieved %s of %s MS Marketplace extensions. %s total versions.' % (len(all_extensions), total, total_all_versions))
                if len(all_extensions) == total:
                    break
                else:
                    get_all_extensions_payload['filters'][0]['pageNumber'] = get_all_extensions_payload['filters'][0]['pageNumber'] + 1

        # Output CSV File
        csv_file = open(CSV_FILE_NAME, 'w')
        csv_file.write("MS Publisher (Namespace), MS Extension, MS DisplayName, MS Pricing, MS Version, MS Date, VSX Version, VSX Date, VSX Publisher, VSX License, Repo\n")
        for ext in extensions:
            print("%s.%s" % (ext['publisher']['publisherName'], ext['extensionName']))
            ms_extension_name, ms_publisher_name, ms_display_name, ms_latest_version, ms_last_updated, ms_repo, ms_pricing = get_ms_info(ext)
            vsx_extension_url = '%s/%s/%s' % (VSX_API, ms_publisher_name, ms_extension_name)
            response = requests.get(vsx_extension_url)
            if response.status_code == 200:
                vsx_results = response.json()
                csv_file.write("%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s\n" % (
                                ms_publisher_name,
                                ms_extension_name,
                                ms_display_name,
                                ms_pricing,
                                ms_latest_version,
                                convert_date_str(ms_last_updated), 
                                vsx_results['version'],
                                convert_date_str(vsx_results['timestamp']),
                                vsx_results['publishedBy']['loginName'],
                                vsx_results.get('license', None),
                                ms_repo
                                ))
            elif response.status_code == 404:
                csv_file.write("%s, %s, %s, %s, %s, %s, , , , %s, %s\n" % (
                        ms_publisher_name,
                        ms_extension_name,
                        ms_display_name,
                        ms_pricing,
                        ms_latest_version,
                        convert_date_str(ms_last_updated),
                        vsx_results.get('license', None),
                        ms_repo
                        ))

            else:
                print(response.status_code)
                print(response.content)
                response.raise_for_status()
        
        # Output JSON File
        json_file = open(JSON_FILE_NAME, 'w')
        json_file.write(json.dumps(all_extensions, indent=4))
        json_file.close()
    except Exception as e:
        print('Error: %s' % e)
        traceback.print_stack()
