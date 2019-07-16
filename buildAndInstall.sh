#!/bin/bash
npm run build
docker build -t turing-backend .
helm upgrade -i --reset-values --recreate-pods turing-backend ./Chart