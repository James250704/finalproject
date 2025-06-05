#!/bin/bash

# 啟動後端服務
cd backend
npm start &

# 啟動前端服務
cd ../
npm run serve &

# 等待兩個服務啟動完成
wait