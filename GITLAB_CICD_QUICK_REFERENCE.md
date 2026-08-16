# GitLab CI/CD Quick Reference

## Quick Start

```bash
# 1. Push .gitlab-ci.yml to repository
git add .gitlab-ci.yml globals.json
git commit -m "Add GitLab CI/CD pipeline"
git push

# 2. View pipeline
# Go to: Project → CI/CD → Pipelines

# 3. Check test results
# Click job → Download postman-report.html
```

---

## Running Tests Locally (Simulate CI)

```bash
# Terminal 1: Start MongoDB
docker run -d --name mongo-test -p 27017:27017 mongo:6.0

# Terminal 2: Setup and run tests
npm install

# Install Newman and HTML reporter globally
npm install -g newman
npm install -g newman-reporter-html

export MONGODB_URI="mongodb://localhost:27017/todoapp"
export NODE_ENV="test"
npm start &

sleep 5

# Run Postman collection exactly as CI does
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -g globals.json \
  -r cli,json,html \
  --reporter-json-export postman-results.json \
  --reporter-html-export postman-report.html \
  --bail \
  --timeout 10000 \
  --timeout-request 5000

# Stop server
pkill -f "node server.js"

# Stop MongoDB
docker stop mongo-test && docker rm mongo-test
```

---

## Common Commands

### View Pipeline Status
```bash
# In GitLab UI:
Project → CI/CD → Pipelines
```

### Check Job Logs
```bash
# In GitLab UI:
CI/CD → Pipelines → [Pipeline ID] → [Job Name]
```

### Download Test Report
```bash
# In GitLab UI:
CI/CD → Pipelines → [Pipeline ID] → test:api:postman → Artifacts → postman-report.html
```

### Skip Pipeline
```bash
git commit -m "Update README [skip ci]"
git push
```

### Manually Trigger Pipeline
```bash
# In GitLab UI:
CI/CD → Pipelines → Run Pipeline
```

### Cancel Running Pipeline
```bash
# In GitLab UI:
CI/CD → Pipelines → [Pipeline ID] → Cancel
```

---

## Environment Variables

### Set in GitLab UI
```
Settings → CI/CD → Variables
```

### Common Variables
```yaml
MONGODB_URI: mongodb://mongo:27017/todoapp
NODE_ENV: test
PORT: 3000
NODE_VERSION: 18
```

### Mark as Protected
- For production credentials only
- Click "Protect variable" checkbox

---

## Troubleshooting

### MongoDB Connection Refused
```bash
# Error: connect ECONNREFUSED 127.0.0.1:27017

# Solution 1: Increase startup delay
sleep 15  # instead of sleep 5

# Solution 2: Check MongoDB service
docker ps | grep mongo

# Solution 3: Verify connection string
echo $MONGODB_URI
```

### Server Not Starting
```bash
# Error: listen EADDRINUSE: address already in use :::3000

# Solution: Kill previous process
pkill -f "node server.js"

# Wait and retry
sleep 2
npm start
```

### Newman Command Not Found
```bash
# Error: command not found: newman

# Solution: Install globally
npm install -g newman

# Verify installation
newman --version
```

### Timeout on Tests
```bash
# Error: Request timeout

# Solution: Increase timeout in pipeline
newman run ... \
  --timeout 15000 \           # Test timeout
  --timeout-request 8000      # Request timeout
```

### Tests Hanging
```bash
# Solution: Kill stuck processes
pkill -f "node server.js"
pkill -f "newman"

# Restart pipeline
# Go to: CI/CD → Pipelines → Cancel
```

---

## Test Results

### Success
```
✓ Status code is 200
✓ Response time is less than 500ms
✓ Response is an array
✓ Completed field is present
...
30 tests passed
```

### Failure
```
✗ Status code is 200 (got 500)
  AssertionError: Expected response code 200, got 500
```

### Analyze Failures
1. Check job logs: **CI/CD → Pipelines → [Job] → Logs**
2. Download JSON report: `postman-results.json`
3. Look at error details
4. Run locally to debug: `npm start` + `newman run`

---

## Performance Tips

### Reduce Pipeline Time

1. **Cache Dependencies**
   ```yaml
   cache:
     paths:
       - node_modules/
   ```

2. **Run Jobs in Parallel**
   ```yaml
   stages:
     - test    # lint, api-tests, unit-tests run together
   ```

3. **Skip Unnecessary Jobs**
   ```yaml
   only:
     - merge_requests
     - main
   ```

4. **Use Docker Layer Caching**
   ```yaml
   image: node:18-slim  # Use slim image
   ```

### Optimization Example
- **Before**: 5 min total (sequential)
- **After**: 2 min total (parallel)

---

## Advanced Features

### Scheduled Runs
```
CI/CD → Schedules → New Schedule
- Frequency: Daily at 2 AM
- Branch: main
```

### Environment-Specific Testing
```yaml
test:api:staging:
  only:
    - tags
  variables:
    BASE_URL: "https://staging-api.example.com"

test:api:prod:
  only:
    - tags
  variables:
    BASE_URL: "https://api.example.com"
```

### Slack Notifications
```
Settings → Integrations → Slack
- Add webhook URL
- Enable notifications
```

### Code Coverage
```
CI/CD → Pipelines → [Pipeline] → Coverage Report
```

---

## Useful Resources

- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [GitLab Runner Setup](https://docs.gitlab.com/runner/install/)
- [Docker Hub - MongoDB](https://hub.docker.com/_/mongo)
- [Docker Hub - Node.js](https://hub.docker.com/_/node)

---

## File Structure

```
ListApplication/
├── .gitlab-ci.yml                 # Main CI/CD configuration
├── globals.json                   # Global variables for Newman
├── Postman_Collection.json        # Test cases
├── Postman_Environment.json       # Environment variables
├── POSTMAN_TESTING_GUIDE.md       # Postman guide
├── GITLAB_CICD_GUIDE.md          # Detailed CI/CD guide
├── server.js                      # Express server
├── models/Todo.js                # Database model
├── __tests__/server.test.js       # Unit tests
└── package.json
```

---

## Verification Checklist

- [ ] `.gitlab-ci.yml` committed to repository
- [ ] MongoDB service configured
- [ ] Node.js version 18+ available
- [ ] Newman installed globally
- [ ] Postman collection runs locally
- [ ] Environment variables set
- [ ] First pipeline passed
- [ ] HTML report generated
- [ ] Merge requests block on test failure

---

## Support

For issues:
1. Check job logs: **CI/CD → Pipelines → [Job] → Logs**
2. Review [GITLAB_CICD_GUIDE.md](./GITLAB_CICD_GUIDE.md)
3. Run tests locally to isolate issue
4. Contact your DevOps team if runner issues
