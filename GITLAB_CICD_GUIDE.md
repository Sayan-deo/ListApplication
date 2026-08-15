# GitLab CI/CD Pipeline Guide

## Overview

This guide explains how the GitLab CI/CD pipeline runs your Postman API test cases automatically for every merge request and commit to main/develop branches.

---

## Pipeline Configuration File

**File**: `.gitlab-ci.yml`

The pipeline is divided into 3 stages:

### 1. **Build Stage** 
   - Installs Node.js dependencies
   - Installs Newman (Postman CLI tool)

### 2. **Test Stage**
   - Lints code with ESLint
   - Runs Postman API tests
   - Executes Jest unit tests

### 3. **Report Stage**
   - Generates test reports
   - Archives results

---

## Pipeline Stages Explained

### Stage 1: Build Dependencies

```yaml
build:dependencies:
  stage: build
  image: node:18
```

**What it does:**
- Uses Node.js 18 Docker image
- Installs all npm dependencies
- Installs Newman globally
- Caches `node_modules/` for faster subsequent runs

**Artifacts:**
- `node_modules/` (cached for 1 hour)

**Runs on:**
- Merge requests
- Pushes to `main` branch
- Pushes to `develop` branch

---

### Stage 2: API Testing with Postman

```yaml
test:api:postman:
  stage: test
  services:
    - mongo:6.0
```

**What it does:**

1. **Setup MongoDB Service**
   - Starts MongoDB 6.0 container
   - Database URI: `mongodb://mongo:27017/todoapp`

2. **Start Application Server**
   - Runs `npm start` in background
   - Waits 5 seconds for server startup
   - Verifies server is responding with health check

3. **Run Postman Tests**
   ```bash
   newman run Postman_Collection.json \
     -e Postman_Environment.json \
     -r json,html,cli \
     --reporter-json-export postman-results.json \
     --reporter-html-export postman-report.html
   ```

4. **Generate Reports**
   - JSON report for CI/CD integration
   - HTML report for manual review
   - CLI output for pipeline logs

5. **Cleanup**
   - Kills the server process
   - Collects artifacts

**Key Features:**
- Timeout: 10 seconds per test
- Request timeout: 5 seconds
- Retries: Up to 2 times on infrastructure failures
- Stops on first failure (`--bail` flag)

**Artifacts:**
- `postman-results.json` (30 days retention)
- `postman-report.html` (30 days retention)

---

### Stage 3: Linting

```yaml
lint:eslint:
  stage: test
```

**What it does:**
- Runs `npm run lint`
- Checks code quality with ESLint
- Non-blocking (allowed failure)

**Artifacts:**
- None (code quality only)

---

### Stage 4: Unit Tests

```yaml
test:unit:
  stage: test
  services:
    - mongo:6.0
```

**What it does:**
- Runs Jest test suite
- Generates coverage report
- Non-blocking (allowed failure)

**Artifacts:**
- Coverage reports (30 days retention)

---

### Stage 5: Report Generation

```yaml
report:postman:
  stage: report
```

**What it does:**
- Confirms test results are available
- Archives HTML report for long-term storage (90 days)
- Only runs when previous stages complete

---

## Setup Instructions

### 1. Prerequisites

Ensure your GitLab runner has:
- Docker support
- Internet access
- At least 2GB RAM
- Node.js capability

### 2. Add to Your Repository

Copy `.gitlab-ci.yml` to your project root:

```bash
cp .gitlab-ci.yml /path/to/ListApplication/.gitlab-ci.yml
git add .gitlab-ci.yml
git commit -m "Add GitLab CI/CD pipeline for Postman API tests"
git push
```

### 3. Verify GitLab Setup

1. Go to your GitLab project
2. Navigate to **CI/CD → Pipelines**
3. You should see your pipeline running

### 4. Configure Runners (if needed)

If no shared runners are available:

1. Go to **Settings → CI/CD → Runners**
2. Install and register a GitLab Runner:
   ```bash
   curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | bash
   sudo apt-get install gitlab-runner
   sudo gitlab-runner register
   ```

---

## Environment Variables

The pipeline uses these variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_VERSION` | 18 | Node.js version |
| `MONGODB_URI` | mongodb://mongo:27017/todoapp | Database connection |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | test | Environment mode |

### Customize Variables

To override variables, add them to `.gitlab-ci.yml`:

```yaml
variables:
  NODE_VERSION: "20"
  PORT: 8080
```

Or set them in GitLab UI:
1. **Settings → CI/CD → Variables**
2. Add custom variables
3. Mark as **Protected** if sensitive

---

## Pipeline Triggers

The pipeline runs automatically on:

### Automatic Triggers
- ✅ Merge request creation/update
- ✅ Push to `main` branch
- ✅ Push to `develop` branch

### Manual Triggers
- You can manually trigger from **CI/CD → Pipelines → Run Pipeline**

### Conditional Triggers

Modify `.gitlab-ci.yml` to change triggers:

```yaml
only:
  - merge_requests
  - main
  - develop
  - tags              # Run on tag pushes
  - schedules         # Run on schedule
```

---

## Monitoring Pipeline Execution

### View Pipeline Status

1. Navigate to **CI/CD → Pipelines**
2. Click on pipeline ID to see details
3. View individual job logs

### Real-time Logs

During pipeline execution:
1. Click on a job (e.g., `test:api:postman`)
2. See live logs in real-time
3. Logs are archived for 30 days

### Pipeline Duration

Expected execution times:
- Build dependencies: ~30 seconds
- Postman tests: ~45 seconds
- Linting: ~10 seconds
- Unit tests: ~15 seconds
- **Total**: ~2-3 minutes

---

## Test Report Details

### HTML Report

After tests complete:
1. Go to **CI/CD → Pipelines**
2. Click on `test:api:postman` job
3. Download `postman-report.html`
4. Open in browser for detailed view

**Report includes:**
- ✅ Passed/Failed test counts
- ✅ Response times
- ✅ Status codes
- ✅ Error messages
- ✅ Test execution timeline

### JSON Report

For programmatic access:
- Download `postman-results.json`
- Contains all test results in structured format
- Can be integrated with other tools

---

## Troubleshooting

### MongoDB Connection Issues

**Error**: `Failed to connect to MongoDB`

**Solution**:
```yaml
services:
  - mongo:6.0

before_script:
  - sleep 10  # Give MongoDB time to start
```

### Server Not Starting

**Error**: `Connection refused on localhost:3000`

**Solution**:
```bash
before_script:
  - npm start &
  - sleep 10  # Increase wait time
  - curl -f http://localhost:3000/todos
```

### Newman Not Found

**Error**: `command not found: newman`

**Solution**:
```yaml
before_script:
  - npm install -g newman  # Install Newman
```

### Timeout on Tests

**Error**: `Request timeout`

**Solution**:
```yaml
script:
  - newman run ... \
      --timeout 15000 \          # Increase timeout
      --timeout-request 8000
```

### Pipeline Stuck in "Running"

**Solution**:
1. Cancel the pipeline: **CI/CD → Pipelines → Cancel**
2. Check runner status: **Admin → Runners**
3. Restart stuck runner if necessary

---

## Performance Optimization

### Caching

The pipeline caches `node_modules/`:

```yaml
cache:
  paths:
    - node_modules/
  key:
    files:
      - package-lock.json
```

Cache invalidates when `package-lock.json` changes.

### Parallel Jobs

Run independent jobs in parallel:

```yaml
stages:
  - build
  - test        # Lint, API tests, Unit tests run in parallel
  - report
```

### Skip Pipeline

To skip pipeline on a commit:

```bash
git commit -m "Update README [skip ci]"
git push
```

---

## Advanced Configuration

### Deploy Only on Success

Add to `.gitlab-ci.yml`:

```yaml
deploy:production:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
  when: on_success        # Only run if all tests pass
```

### Slack Notifications

Add webhook integration:

1. **Settings → Integrations → Slack**
2. Add webhook URL
3. Enable notifications on pipeline events

### Scheduled Runs

Run tests on a schedule:

1. **CI/CD → Schedules → New schedule**
2. Set frequency (e.g., daily at 2 AM)
3. Select branch
4. Save

Pipeline will run automatically on schedule.

### Matrix Builds

Test multiple Node versions:

```yaml
test:api:postman:
  parallel:
    matrix:
      - NODE_VERSION: ["18", "20", "22"]
```

---

## Integration with Merge Requests

### Auto-blocking

Merge requests automatically block if tests fail:

```yaml
test:api:postman:
  allow_failure: false    # Fail the pipeline
```

### Pass/Fail Badge

Add to README:

```markdown
[![Pipeline Status](https://gitlab.com/yourname/ListApplication/-/raw/main/badges/pipeline.svg)](https://gitlab.com/yourname/ListApplication/-/pipelines)
```

---

## CI/CD Best Practices

1. ✅ **Run tests on every commit** - Catch issues early
2. ✅ **Use environment-specific configs** - Different settings per stage
3. ✅ **Cache dependencies** - Faster pipeline execution
4. ✅ **Parallel jobs** - Reduce total execution time
5. ✅ **Keep logs** - For debugging and audit trails
6. ✅ **Retry on failure** - Handle transient failures
7. ✅ **Secure sensitive data** - Use protected variables
8. ✅ **Review reports** - Check test results after merge

---

## Useful Commands

### Run Postman Tests Locally (Simulate CI)

```bash
# Install dependencies
npm install
npm install -g newman

# Start MongoDB
docker run -d -p 27017:27017 mongo:6.0

# Set environment
export MONGODB_URI="mongodb://localhost:27017/todoapp"
export NODE_ENV="test"

# Start server
npm start &

# Run tests
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -r json,html \
  --reporter-json-export postman-results.json \
  --reporter-html-export postman-report.html
```

### View Pipeline in Terminal

```bash
# Install gitlab-runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | bash
sudo apt-get install gitlab-runner

# Debug job locally (requires registration)
gitlab-runner exec docker test:api:postman
```

---

## Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Module not found" | Dependencies not installed | Rebuild cache: `CI/CD → Pipelines → Run Pipeline` with cache clear |
| "MongoDB connection refused" | Service not started | Increase sleep time in `before_script` |
| "Port 3000 already in use" | Previous server still running | Ensure cleanup: `kill $SERVER_PID` |
| "Newman command not found" | Global install missing | Add `npm install -g newman` to `before_script` |
| "Tests timeout" | Tests taking too long | Increase `--timeout` value |
| "Artifacts not found" | Previous stage failed | Fix dependencies in earlier stages |

---

## Example Pipeline Run

### Successful Run Output

```
Building...
✓ Building Docker image
✓ Installing dependencies (45s)
✓ Installing Newman (5s)

Running tests...
✓ Starting MongoDB service
✓ Starting application server
✓ Running Postman collection (30s)
  - 30 tests passed
  - 0 tests failed
  - Response time: 234ms average

Generating reports...
✓ Creating JSON report
✓ Creating HTML report
✓ Archiving artifacts

✓ Pipeline succeeded in 2m 15s
```

---

## Next Steps

1. ✅ Push `.gitlab-ci.yml` to repository
2. ✅ Monitor first pipeline run in **CI/CD → Pipelines**
3. ✅ Download HTML report to verify tests
4. ✅ Configure merge request protection (Settings → Merge requests)
5. ✅ Set up notifications (Integrations → Slack)
6. ✅ Schedule regular runs (CI/CD → Schedules)

---

## Support & Documentation

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab Runner Documentation](https://docs.gitlab.com/runner/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [Docker Documentation](https://docs.docker.com/)

---

## Questions?

For help with:
- **Postman tests**: See [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)
- **Pipeline issues**: Check job logs in **CI/CD → Pipelines**
- **GitLab setup**: Visit [GitLab Support](https://support.gitlab.com/)
