@echo off
heroku pg:psql postgresql-fluffy-54728 --app cloud-assignment-1 < schema.sql
heroku pg:psql postgresql-fluffy-54728 --app cloud-assignment-1 < testData.sql