# Getting started with a gitpod workspace
- Fork eclipse/openvsx
- Create a github oauth app: https://github.com/settings/developers. Instructions: https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/. 
   - App main page is URL at port `3000`, e.g.: https://3000-kineticsquid-openvsx-bb9bmwaxmbc.ws-us83.gitpod.io.
   - Instructions for getting the callback URL: https://github.com/eclipse/openvsx/blob/master/README.md. Involves running this script: `server/scripts/callback-url.sh github`. Callback looks like: http://8080-kineticsquid-openvsx-bb9bmwaxmbc.ws-us83.gitpod.io/login/oauth2/code/github.
- Do this everytime you get a new workspace because the URL changes.
- Define environment variables with the Github Oauth app client ID and secret in gitpod.io account settings: https://gitpod.io/variables
- Execute the following to update current terminal session with current environment values. Do this for each terminal session. Then you need to stop the UI and server, rebuild them, and restart.
```
eval $(gp env -e)
```
- To rebuild
1. Shut down UI and server processes
1. Run `npm install` to update node modules if necessary.
1. `cd webui`
1. `yarn build`
1. `yarn build:default`
1. `cd server`
1. `./gradlew build`
1. Restart server and webui
1. `./gradlew runServer`
1. `yarn start:default`

# Grant admin access
To gain admin access: Currently that's done in the DB - first log in though github, open psql, then change the user_data table and set your own role to admin.
```
update user_data set role = 'admin' where login_name = 'kineticsquid';
```

# DB Commands
- `psql` then:
- `\l` - list data bases
- `\dt` - list tables
- `\d [table]` - describe a table
- `\du` - List all users and their assign roles	
- `\q` - quit psql command shell
- `\o [filename]` - send output to a file

# Tables
```
Schema |                        Name                         | Type  | Owner  
--------+-----------------------------------------------------+-------+--------
 public | admin_statistics                                    | table | gitpod
 public | admin_statistics_extensions_by_rating               | table | gitpod
 public | admin_statistics_publishers_by_extensions_published | table | gitpod
 public | admin_statistics_top_most_active_publishing_users   | table | gitpod
 public | admin_statistics_top_most_downloaded_extensions     | table | gitpod
 public | admin_statistics_top_namespace_extension_versions   | table | gitpod
 public | admin_statistics_top_namespace_extensions           | table | gitpod
 public | azure_download_count_processed_item                 | table | gitpod
 public | download                                            | table | gitpod
 public | entity_active_state                                 | table | gitpod
 public | extension                                           | table | gitpod
 public | extension_review                                    | table | gitpod
 public | extension_version                                   | table | gitpod
 public | file_resource                                       | table | gitpod
 public | flyway_schema_history                               | table | gitpod
 public | jobrunr_backgroundjobservers                        | table | gitpod
 public | jobrunr_jobs                                        | table | gitpod
 public | jobrunr_metadata                                    | table | gitpod
 public | jobrunr_migrations                                  | table | gitpod
 public | jobrunr_recurring_jobs                              | table | gitpod
 public | migration_item                                      | table | gitpod
 public | namespace                                           | table | gitpod
 public | namespace_membership                                | table | gitpod
 public | namespace_social_links                              | table | gitpod
 public | persisted_log                                       | table | gitpod
 public | personal_access_token                               | table | gitpod
 public | shedlock                                            | table | gitpod
 public | signature_key_pair                                  | table | gitpod
 public | spring_session                                      | table | gitpod
 public | spring_session_attributes                           | table | gitpod
 public | user_data                                           | table | gitpod
(31 rows)
```

# Publishing
Create namespace:
```
npx ovsx create-namespace <name> -p [access token - from settings]
npx ovsx create-namespace ksquid -p [access token - from settings] -r https://3000-kineticsquid-openvsx-bb9bmwaxmbc.ws-us82.gitpod.io
```

Publish `.vsix` file:
```
npx ovsx publish <file> -p [access token - from settings] -r https://3000-kineticsquid-openvsx-bb9bmwaxmbc.ws-us82.gitpod.io
```

