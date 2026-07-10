# DrMed — Full AWS Deployment (nothing runs on your desktop)

Everything lives in AWS: the app on **Amplify Hosting**, the database on **RDS PostgreSQL**, prescription files on **S3**. Builds, migrations, and data seeding run automatically in the cloud on every deploy — you never run npm or install anything locally.

The only desktop step is a one-time push of this project folder to GitHub (Amplify pulls code from there on every change).

> **Cost:** new AWS accounts get 12 months of RDS free tier (db.t4g.micro); after that ~₹1,000–1,400/month. Amplify and S3 have free tiers that easily cover a demo. A card is required to open the account.

## 1. AWS account

1. Sign up at https://aws.amazon.com — set console region to **Mumbai (ap-south-1)** (top-right)
2. Enable MFA on the root account (Security credentials → MFA)

## 2. Database — RDS PostgreSQL

1. Console → **RDS** → **Create database** → Standard create → PostgreSQL → Template: **Free tier**
2. Settings: identifier `drmed-db` · username `postgres` · set a strong password (save it)
3. Instance `db.t4g.micro`, storage 20 GB
4. Connectivity: **Public access: Yes** · new security group `drmed-db-sg`
5. Additional configuration → **Initial database name: `drmed`**
6. Create (~10 min) → open the DB → copy the **Endpoint**
7. EC2 → Security Groups → `drmed-db-sg` → Inbound rules → add: PostgreSQL (5432), Source `0.0.0.0/0`
   *(needed so Amplify's build servers can run migrations — see the security checklist to lock this down properly later)*

Your connection string (used in step 5):
```
postgresql://postgres:YOUR_PASSWORD@YOUR-ENDPOINT.ap-south-1.rds.amazonaws.com:5432/drmed?sslmode=require
```

## 3. Storage — S3 bucket

1. Console → **S3** → Create bucket: `drmed-prescriptions-<something-unique>` · ap-south-1
2. Keep **Block all public access ON** (private medical documents)

## 4. Code — push to GitHub (the one desktop step)

Easiest: install **GitHub Desktop** (desktop.github.com), sign in, *Add local repository* → select the `drmed` folder → Publish repository (private).

Alternatively, in a terminal: create an empty private repo on github.com, then
```bash
git remote add origin https://github.com/YOUR-USERNAME/drmed.git
git push -u origin main
```

After this, all future changes I make in your folder just need a "push" click in GitHub Desktop — Amplify redeploys automatically.

## 5. App — Amplify Hosting

1. Console → **Amplify** → Create new app → **GitHub** → authorize → pick the `drmed` repo, branch `main`
2. The included `amplify.yml` is detected automatically — it installs dependencies, applies database migrations, seeds the medicines and demo users, and builds. All in the cloud.
3. Before the first deploy: **Advanced settings → Environment variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the RDS string from step 2 |
| `NEXTAUTH_URL` | your Amplify URL (add after first deploy, then redeploy) |
| `NEXTAUTH_SECRET` | any long random string |
| `AWS_S3_BUCKET` | your bucket name from step 3 |
| `AWS_REGION` | `ap-south-1` |
| `OTP_DEBUG` | `1` — login OTPs appear on-screen so you can test without SMS |

4. Deploy. First build takes ~5–10 min. You get a URL like `https://main.xxxx.amplifyapp.com`
5. Set `NEXTAUTH_URL` to that URL and redeploy (Amplify → Redeploy this version)
6. S3 permission: Amplify → App settings → IAM roles → attach/extend the service role with `s3:PutObject`/`s3:GetObject` on your bucket

## 6. Test the live site

1. Open your Amplify URL → add medicines to cart → checkout → sign in with any 10-digit number — the OTP appears on screen (test mode)
2. Place the order — it's written to RDS, stock decremented batch-by-batch
3. Demo staff logins: `9000000001` (admin), `9000000002` (pharmacist)

## Security checklist before real patients

- [ ] Remove `OTP_DEBUG` and wire real SMS/WhatsApp (Phase 3)
- [ ] RDS: Public access → No; restrict 5432 to the app's VPC instead of 0.0.0.0/0
- [ ] Separate DB user for the app (not the master password); rotate credentials
- [ ] Move secrets to AWS Secrets Manager
- [ ] Enable RDS automated backups (7+ days) and S3 versioning
- [ ] CloudWatch alarms on DB CPU/storage/connections
