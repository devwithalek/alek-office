
  GNU nano 8.6                                                                                        readme.md

# The Alek Ofice
The Alek Office is an office suite, focused on privacy and [steganograpy](https://en.wikipedia.org/wiki/Steganography). developed by [Alek](https://aleklab.cloud).
The cloud version currently supports CRDT collaborative document editing/sharing, and E2E document editing/sharing, as well as a PDF steganography tool.
## Self hosting
It can be self hosted through Docker, a reverse Proxy, and external Redis and Mongo instances, or used with docker compose to run this services internally.
### Requirements
* docker
* docker-compose
### Optional
* A redis instance
* A mongoDB instance
* A reverse proxy to serve the static files + the app (i love nginx but caddy is fine too)
### Getting started
First clone  the repo:
```git clone https://github.com/devwithalek/alek-office && cd alek-office```

Then you can populate the .env file with your own variables; only the SESSIONKEY variable is not optional.
```
#SESSIONKEY=exampleSessionKey

#DEBUG=*

#MONGOURL=mongodb://mongodburl

#REDISURL=redis://redisurl
```
### Options
#### Running all the services internally
You can run all the required services internally, using docker compose:
```
docker compose up 
```
This will spin up all the required services internally, and will serve the app at [localhost:3000](https://localhost:3000) 
#### Pick and choose

You can run only your desired services internally, using the docker compose syntax:
##### Example 1, external mongo and redis:
```
docker compose up alekoffice nginx
```
This will only  spin up the main process, and nginx serving the static files. By doing this, the app will rely on the services whom urls you specified on the .env file.
##### Example 2, external reverse proxy:
```
docker compose up alekoffice mongodb redis
```
This will only  spin up the main process, and an instance of both Redis and Mongo. By doing this, the app will rely on your own reverse proxy to serve the static files and routing oncoming traffic into the app.
##### Example 3, standalone app:
```
docker compose up alekoffice
```
This will only  spin up the main process at port 3000, by doing this you can use your own Mongo and Redis isntances, as well as your desired reverse proxy to route the app and the static files; Good luck!


## Coming soon
A new fully managed SAAS, with more features will be launched soon.
## Law Enforcement
You can mail lawenforcement@aleklab.cloud for tips / requests about suspected illegal activity regarding the software or the fully managed Saas.
## Authors
### Author
[TheAlekLab](https://aleklab.cloud)
### Contributors
Alek Orlov


## License

This project is licensed under the GNU General Public License v3.0 License - see the LICENSE.md file for details
