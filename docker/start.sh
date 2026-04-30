#!/bin/sh
set -eu

mkdir -p /app/storage/student-files /app/storage/student-profile-images

./node_modules/.bin/prisma migrate deploy

exec node server.js
