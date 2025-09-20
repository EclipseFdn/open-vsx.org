# Open VSX Reports 
Reports and supporting scripts for graphing availability and activity at open-vsx.org. Most require some sort of access token.

### graph_availability_trends.ipynb
Jupyter notebook for graphing site availability based on data from Better Stack, née Better Uptime. Requires an access key from the IT Team. 

### graph_licenses.ipynb
Jupyter notebook that provides a count of the different types of licenses and a pie chart of their distribution.

### graph_most_active.ipynb
Jupyter notebook that uses admin reports from open-vsx.org/admin/report API to graph by month. Requires an access token with admin level authority.
- Users publishing the most extensions
- Namespaces with the most extensions
- Namespaces with the most extension versions
- Most downloaded extensions

### graph_trends.ipynb
Jupyter notebook that graphs total downloads, extensions and publishers by month. Requires an access token.

### get_all_extensions.py
Script to collect metadata on all published extensions. Outputs JSON and CSV.

### get_availaibility_data.py
Script to collect availability data from open-vsx endpoints monitored by Better Stack.

### get_open_vsx_data.py
Script to collect activity data.

### get_vs_marketplace_data.py
Script to collect meta data on all published extensions at VS Code Marketplace.

