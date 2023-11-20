### Running in stateless mode, define configs inside kong.json file and then call the kong api
curl -i -X POST --url http://localhost:8001/config \
  --data @kong.json \
  --header "Content-Type: application/json"