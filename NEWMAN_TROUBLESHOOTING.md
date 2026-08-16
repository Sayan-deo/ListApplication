# Newman Testing Troubleshooting Guide

## Common Issues and Solutions

### 1. Newman HTML Reporter Not Found

**Error:**
```
newman: could not find "html" reporter
  ensure that the reporter is installed in the same directory as newman
  run `npm install newman-reporter-html`
```

**Solution:**

```bash
# Install the HTML reporter globally
npm install -g newman-reporter-html

# Verify installation
newman --version
npm list -g newman-reporter-html
```

**Alternative:** Install locally in your project:
```bash
npm install --save-dev newman-reporter-html
```

---

### 2. MongoDB Connection Refused

**Error:**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Start MongoDB if not running
docker run -d -p 27017:27017 mongo:6.0

# Verify connection
mongosh "mongodb://localhost:27017/todoapp"
```

---

### 3. Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000        # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
PORT=3001 npm start
```

---

### 4. Server Takes Too Long to Start

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:**

Increase the wait time before running tests:

```bash
npm start &
sleep 10  # Increase from 5 to 10 seconds
```

Or use the automatic retry loop:

```bash
for i in {1..30}; do
  if curl -f http://localhost:3000/todos > /dev/null 2>&1; then
    echo "API is ready"
    break
  fi
  echo "Waiting for API... ($i/30)"
  sleep 1
done
```

---

### 5. Tests Timeout

**Error:**
```
Error: Request timeout
```

**Solution:**

Increase timeout values:

```bash
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  --timeout 15000 \           # Increase from 10000 to 15000
  --timeout-request 8000      # Increase from 5000 to 8000
```

---

### 6. Newman Command Not Found

**Error:**
```
command not found: newman
```

**Solution:**

```bash
# Install Newman globally
npm install -g newman

# Verify installation
which newman
newman --version

# Or run locally
npx newman --version
```

---

### 7. HTML Report Not Generated

**Symptoms:** Test runs complete but no `postman-report.html` file

**Solution:**

```bash
# Ensure reporter is installed
npm install -g newman-reporter-html

# Run with explicit HTML reporter
newman run Postman_Collection.json \
  -r cli,json,html \
  --reporter-html-export postman-report.html
```

---

### 8. Tests Hang or Don't Complete

**Error:** Tests running but never finish

**Solution:**

```bash
# Kill all Node processes
pkill -f "node server.js"

# Kill all Newman processes
pkill -f "newman"

# Stop MongoDB
docker stop mongo-test
docker rm mongo-test

# Restart everything
docker run -d -p 27017:27017 mongo:6.0
npm start &
sleep 5
newman run Postman_Collection.json ...
```

---

### 9. Tests Fail with 500 Errors

**Error:**
```
AssertionError: Expected response code 200, got 500
```

**Solution:**

1. Check server logs:
```bash
npm start  # Don't run in background
```

2. Check MongoDB is connected:
```bash
docker logs <container_id>
```

3. Check environment variables:
```bash
echo $MONGODB_URI
echo $NODE_ENV
```

4. Verify collections exist:
```bash
curl http://localhost:3000/todos
```

---

### 10. Permission Denied on Script

**Error (Linux/macOS):**
```
Permission denied: ./run-local-tests.sh
```

**Solution:**

```bash
chmod +x run-local-tests.sh
./run-local-tests.sh
```

---

## Installation Verification Checklist

### Verify Newman Installation

```bash
# Check global installation
npm list -g newman
npm list -g newman-reporter-html

# Check versions
newman --version
# Should output something like: 6.1.0

# Test basic command
newman --help
```

### Verify Dependencies

```bash
# From project root
npm install
npm install -g newman
npm install -g newman-reporter-html

# Verify package.json includes them
cat package.json | grep -A5 devDependencies
```

### Verify MongoDB

```bash
# Check Docker is running
docker ps

# Verify MongoDB container
docker logs mongo-test
```

### Verify API Server

```bash
# Start server
npm start

# In another terminal, test the API
curl http://localhost:3000/todos
```

---

## Quick Fixes

### Fix All Issues at Once

```bash
# Complete fresh start
npm install
npm install -g newman
npm install -g newman-reporter-html
docker stop mongo-test 2>/dev/null || true
docker rm mongo-test 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true

# Start fresh
docker run -d --name mongo-test -p 27017:27017 mongo:6.0
npm start &
sleep 5

# Run tests
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -g globals.json \
  -r cli,json,html \
  --reporter-json-export postman-results.json \
  --reporter-html-export postman-report.html
```

---

## Automated Testing Script Issues

### macOS/Linux Script Fails

**Solution:**

```bash
# Ensure script is executable
chmod +x run-local-tests.sh

# Run with explicit bash
bash run-local-tests.sh

# Or debug with verbose output
bash -x run-local-tests.sh
```

### Windows Script Fails

**Solution:**

```cmd
# Ensure you're in the correct directory
cd C:\path\to\ListApplication

# Run the batch file
run-local-tests.bat

# Or open in admin CMD if needed
```

---

## Manual Testing Walkthrough

If automated scripts fail, try manual steps:

```bash
# Step 1: Install dependencies
npm install

# Step 2: Install Newman reporters
npm install -g newman
npm install -g newman-reporter-html

# Step 3: Start MongoDB
docker run -d --name mongo-test -p 27017:27017 mongo:6.0
sleep 3

# Step 4: Start API server
export MONGODB_URI="mongodb://localhost:27017/todoapp"
export NODE_ENV="test"
npm start &
sleep 5

# Step 5: Test API is running
curl http://localhost:3000/todos

# Step 6: Run tests
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -g globals.json \
  -r cli,json,html \
  --reporter-json-export postman-results.json \
  --reporter-html-export postman-report.html

# Step 7: Open report
open postman-report.html  # macOS
xdg-open postman-report.html  # Linux
start postman-report.html  # Windows
```

---

## GitLab CI/CD Pipeline Issues

### Pipeline Fails with Reporter Not Found

**Check:** `.gitlab-ci.yml` has proper before_script

```yaml
before_script:
  - npm install -g newman
  - npm install -g newman-reporter-html
```

### Pipeline Tests Timeout

**Increase timeout in script section:**

```yaml
script:
  - newman run ... \
      --timeout 15000 \
      --timeout-request 8000
```

---

## Reporting Issues

When reporting issues, include:

```bash
# Newman version
newman --version

# Node.js version
node --version

# npm version
npm --version

# Installed reporters
npm list -g | grep newman

# System info
uname -a  # macOS/Linux
systeminfo  # Windows

# Full error output
newman run ... --verbose
```

---

## Performance Tips

### Reduce Test Duration

1. **Use CLI reporter only** (faster than HTML):
```bash
newman run ... -r cli
```

2. **Run specific tests** instead of entire collection:
```bash
newman run Postman_Collection.json \
  --folder "API Tests"
```

3. **Increase timeout values** (reduces retries):
```bash
--timeout 15000 --timeout-request 8000
```

### Parallel Testing

Run multiple test suites simultaneously:
```bash
newman run Collection1.json &
newman run Collection2.json &
wait
```

---

## Support Resources

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [Newman Reporter HTML GitHub](https://github.com/postmanlabs/newman-reporter-html)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)

---

## Quick Links

- **Postman Testing Guide**: [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)
- **GitLab CI/CD Guide**: [GITLAB_CICD_GUIDE.md](./GITLAB_CICD_GUIDE.md)
- **Quick Reference**: [GITLAB_CICD_QUICK_REFERENCE.md](./GITLAB_CICD_QUICK_REFERENCE.md)
