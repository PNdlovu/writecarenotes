@echo off
set ELASTICSEARCH_URL=http://localhost:9200
set ELASTICSEARCH_USERNAME=
set ELASTICSEARCH_PASSWORD=
npx tsx scripts/setup-elasticsearch.ts
