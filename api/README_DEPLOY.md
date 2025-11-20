# Deploy instructions for API (Serverless + Lambda)

This document explains how to redeploy the API located in `api/` to AWS using Serverless Framework, and how to verify the deployment and troubleshoot common issues.

Prerequisites
- Node.js and npm installed
- Serverless Framework CLI (optional globally) or use `npx serverless`
- AWS credentials configured (via `aws configure` or environment variables / named profile)

Quick deploy (from repo root or `api/`):

```powershell
cd c:\Users\Larsi\Aplicaciones_web\api
npm install
npx serverless deploy --verbose
```

Notes before deploy
- `serverless.yml` already contains default DB env values. In production you may want to use Secrets Manager or environment variables in CI instead of plaintext in the YAML.
- Ensure the IAM role used by the Lambda has permission for RDS and network config if the function runs in a VPC.

Verify after deploy

- Check the published API URL from the `serverless deploy` output (look for `endpoints:`). Test the health endpoint:

```powershell
curl -v "<API_BASE>/health"
curl -v "<API_BASE>/dashboard/diagnosticos"
```

- If the call returns 200 and JSON with `ok: true`, the RDS connection from Lambda works.

Troubleshooting
- If you receive HTTP 500 from API Gateway:
  - Check CloudWatch logs for the Lambda function to see stack traces.
  - Confirm Lambda environment variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` are correct.
  - If Lambda needs access to RDS in a private subnet, ensure the Lambda function is configured to run in the same VPC/subnets and has the proper security group allowing outbound to RDS port 3306.

CloudWatch (quick):

```powershell
# list recent events (change <function-name> accordingly)
aws logs filter-log-events --log-group-name "/aws/lambda/<function-name>" --limit 50
```

Rollback / test locally
- You can run the API locally for testing (it uses Express). Example:

```powershell
cd c:\Users\Larsi\Aplicaciones_web\api
npm install
node index.js
# then in another terminal
curl http://localhost:3000/health
curl http://localhost:3000/dashboard/diagnosticos
```

Security note
- Avoid committing production DB credentials into version control. Prefer Secrets Manager or environment variables in CI.

If you want, I can prepare a git branch and a small commit message summarizing the fix to `index.js`, and provide the exact `sls deploy` command you should run with your AWS credentials.
