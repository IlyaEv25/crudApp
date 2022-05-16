# crudApp

CRUD Endpoints(examples mostly):

curl -X GET http://localhost:8080/users/

curl -X POST -H "Content-type: application/json" -d '{"username":"You", "password": "Me"}' http://localhost:8080/users/

curl -X GET http://localhost:8080/records/

curl -X GET http://localhost:8080/records/:record_id

curl -X GET http://localhost:8080/records/:record_id

curl -X POST -H "Content-type: application/json" -d '{"username":"You", "header": "NewRecord", "body": "Record", "recordID": 5}' http://localhost:8080/users/

curl -X DELETE http://localhost:8080/records/:record_id

curl -X PUT -H "Content-type: application/json" -d '{"username":"You", "header": "NewRecord", "body": "Record", "recordID": 5}' http://localhost:8080/records/:record_id 

to run:

'docker compose up --build'

There are PGAdmin, Postgres, Kafka, kafdrop in containers.
