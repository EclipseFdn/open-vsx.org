"""  
Script to collect availability data from open-vsx endpoints monitored by
betteruptime. Used by graph_availability_trends Jupyter Notebook.Requires 
an access token from IT team. 
"""
import requests
from datetime import datetime, timedelta
import numpy as np
import os
import calendar
import time
from urllib.parse import urlparse

API_URL = 'https://betteruptime.com/api/v2'
TOKEN = os.getenv('TOKEN')
HEADERS = {'Authorization': 'Bearer %s' % TOKEN}

def make_api_call(url):
    # print("Calling %s" % url)
    retry_count = 5
    done = False
    while not done:
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            done = True
        except requests.exceptions.RequestException as e:
            if retry_count > 0:
                print(" %s, retrying..." % e)
                time.sleep((6 - retry_count) * 5)
                retry_count = retry_count - 1
            else:
                raise

    return response.json()

def get_all_monitors():
    all_openvsx_monitors = []
    all_monitors_url = '%s/monitors' % API_URL
    done = False
    while not done:
        json_results = make_api_call(all_monitors_url)
        for monitor in json_results['data']:
            hostname = urlparse(monitor['attributes']['url']).hostname
            if hostname == 'open-vsx.org':
                all_openvsx_monitors.append(monitor)
        next_page = json_results['pagination'].get('next')
        if next_page is None:
            done = True
        else:
            all_monitors_url = next_page
    return all_openvsx_monitors

def get_monitor_url(id, start_date, end_date):
    return '%s/monitors/%s/sla?from=%s&to=%s' % (API_URL, id, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))

def get_monitor_data(monitor, time_span):
    monitor_id = monitor['id']
    name = monitor['attributes']['pronounceable_name']
    date_str = monitor['attributes']['created_at']
    start_date = datetime.strptime(date_str[0:10], '%Y-%m-%d')
    end_date = start_date + timedelta(days=time_span)
    today = datetime.now()
    dates = []
    sla_data = []
    downtime_data = []
    print('processing %s' % name)
    while end_date <= today:
        availability_url = get_monitor_url(monitor_id, start_date, end_date)
        json_results = make_api_call(availability_url)
        dates.append(np.datetime64(end_date.strftime('%Y-%m-%d')))
        sla_data.append(json_results['data']['attributes']['availability'])
        downtime_url = get_monitor_url(monitor_id, start_date, start_date)
        json_results = make_api_call(downtime_url)
        downtime_data.append(json_results['data']['attributes']['total_downtime']/60)
        start_date = start_date + timedelta(days=1)
        end_date = end_date + timedelta(days=1)
    print('finished processing')
    return name, dates, sla_data, downtime_data

def get_continuous_data(time_span=30):
    monitors = get_all_monitors()
    results = []
    for monitor in monitors:
        name, dates, sla_data, downtime_data = get_monitor_data(monitor, time_span)
        results.append({'name': name,
                        'dates': dates,
                        'sla_data': sla_data,
                        'downtime_data': downtime_data})
    return results

def get_monthly_monitor_data(monitor):
    monitor_id = monitor['id']
    name = monitor['attributes']['pronounceable_name']
    date_str = monitor['attributes']['created_at']
    interval_start_date = datetime.strptime(date_str[0:10], '%Y-%m-%d')
    end_date = datetime.now()
    dates = []
    sla_data = []
    downtime_data = []
    print('processing %s' % name)
    while interval_start_date < end_date:
        interval_days_in_month = calendar.monthrange(interval_start_date.year, interval_start_date.month)[1]
        interval_end_date = interval_start_date + timedelta(days=interval_days_in_month - interval_start_date.day)
        availability_url = get_monitor_url(monitor_id, interval_start_date, interval_end_date)
        json_results = make_api_call(availability_url)
        dt = interval_start_date.strftime('%Y-%m')
        dates.append(np.datetime64(dt))
        sla_data.append(json_results['data']['attributes']['availability'])
        downtime_url = get_monitor_url(monitor_id, interval_start_date, interval_end_date)
        json_results = make_api_call(downtime_url)
        downtime_data.append(json_results['data']['attributes']['total_downtime']/60)
        interval_start_date = interval_end_date + timedelta(days=1)

    print('finished processing')
    return name, dates, sla_data, downtime_data

def get_monthly_data():
    monitors = get_all_monitors()
    results = []
    for monitor in monitors:
        name, dates, sla_data, downtime_data = get_monthly_monitor_data(monitor)
        results.append({'name': name,
                        'dates': dates,
                        'sla_data': sla_data,
                        'downtime_data': downtime_data})
    return results


if __name__ == '__main__':
    results = get_monthly_data()
    print(results)

