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
    current_year = date.today().year
    current_month = date.today().month
    data = {}
    for header in HEADERS:
        data[header] = []
    for year in range(starting_year, current_year + 1):
        for month in range(1, 13):
            if year == starting_year and month >= starting_month or \
                starting_year < year < current_year or year == current_year and month <= current_month:
                url = '%sadmin/report?year=%s&month=%s&token=%s' % (API_ENDPOINT, year, month, ACCESS_TOKEN)
                response = requests.get(url)
                if response.status_code == 200:
                    try:
                        json_results = response.json()
                        for col in HEADERS:
                            data[col].append(json_results[col])
                        year_month = '%s-%s' % (year, month)
                        print("processed results for %s" % year_month)
                    except JSONDecodeError:
                        json_results = None
                        print("Error decoding JSON results for %s" % url)
                else:
                    print("%s error processing results for %s" % (response.status_code, url))
    df = pd.DataFrame(data,columns=HEADERS)
    return df

def get_most_active_data(starting_year, starting_month):

    def process_data(most_active):
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

    current_year = date.today().year
    current_month = date.today().month

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
    for year in range(starting_year, current_year + 1):
        for month in range(1, 13):
            if year == starting_year and month >= starting_month or \
                starting_year < year < current_year or year == current_year and month <= current_month:
                url = '%sadmin/report?year=%s&month=%s&token=%s' % (API_ENDPOINT, year, month, ACCESS_TOKEN)
                response = requests.get(url)
                if response.status_code == 200:
                    try:
                        json_results = response.json()
                        if len(json_results['topMostActivePublishingUsers']) > 0 or len(json_results['topNamespaceExtensions']) > 0 or \
                            len(json_results['topNamespaceExtensionVersions']) > 0 or len(json_results['topMostDownloadedExtensions']) > 0:
                            year_month = '%s/%s' % (month, str(year)[2:])
                            most_active['dates'].append(year_month)
                            most_active['topMostActivePublishingUsers'][year_month] = json_results['topMostActivePublishingUsers']
                            for item in json_results['topMostActivePublishingUsers']:
                                if item['userLoginName'] not in most_active['topMostActivePublishingUsers']['unique']:
                                    most_active['topMostActivePublishingUsers']['unique'].append(item['userLoginName'])
                            most_active['topNamespaceExtensions'][year_month] = json_results['topNamespaceExtensions']
                            for item in json_results['topNamespaceExtensions']:
                                if item['namespace'] not in most_active['topNamespaceExtensions']['unique']:
                                    most_active['topNamespaceExtensions']['unique'].append(item['namespace'])
                            most_active['topNamespaceExtensionVersions'][year_month] = json_results['topNamespaceExtensionVersions']
                            for item in json_results['topNamespaceExtensionVersions']:
                                if item['namespace'] not in most_active['topNamespaceExtensionVersions']['unique']:
                                    most_active['topNamespaceExtensionVersions']['unique'].append(item['namespace'])
                            most_active['topMostDownloadedExtensions'][year_month] = json_results['topMostDownloadedExtensions']
                            for item in json_results['topMostDownloadedExtensions']:
                                if item['extensionIdentifier'] not in most_active['topMostDownloadedExtensions']['unique']:
                                    most_active['topMostDownloadedExtensions']['unique'].append(item['extensionIdentifier'])
                    except JSONDecodeError:
                        json_results = None
                        print("Error decoding JSON results for %s" % url)
                else:
                    print("%s error processing results for %s" % (response.status_code, url))
    
    resulting_dfs = process_data(most_active)

    return resulting_dfs

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

