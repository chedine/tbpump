### Live transpilation
tsc -w
### Test watch
npm run-script test:watch
### Run

#### Initialize database
node build/src/index init

#### ETL for a date range
node build/src/index download 20170601 20170610
#### ETL since last refresh
node build/src/index refresh
## hello
