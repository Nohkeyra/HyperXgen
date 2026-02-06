#!/bin/bash
cd ~/hyperxgen7/HyperXgen
npm run build
npx serve -s dist -p 8080
