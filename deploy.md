# Deploying to AWS (S3 + CloudFront + Route 53)

## Prerequisites
- AWS CLI configured (`aws configure`)
- A registered domain (dylanquesada.com) — buy in Route 53 or transfer there
- An ACM certificate for dylanquesada.com (must be in us-east-1 for CloudFront)

---

## Step 1 — Create an S3 bucket

```bash
# Bucket name must match your domain
aws s3 mb s3://dylanquesada.com --region us-east-1

# Enable static website hosting
aws s3 website s3://dylanquesada.com \
  --index-document index.html \
  --error-document index.html
```

## Step 2 — Upload files

```bash
aws s3 sync . s3://dylanquesada.com \
  --exclude "*.md" \
  --exclude ".git/*" \
  --delete
```

## Step 3 — Request an ACM certificate (HTTPS)

1. Go to AWS Console → Certificate Manager → **Request certificate**
2. Add domain names: `dylanquesada.com` and `www.dylanquesada.com`
3. Choose **DNS validation** → confirm → wait for "Issued" status

## Step 4 — Create a CloudFront distribution

1. Go to CloudFront → **Create distribution**
2. Origin domain: your S3 website endpoint (e.g. `dylanquesada.com.s3-website-us-east-1.amazonaws.com`)
   - Use **Custom origin**, not S3 origin, so redirects work
3. Viewer protocol policy: **Redirect HTTP to HTTPS**
4. Alternate domain names (CNAMEs): `dylanquesada.com`, `www.dylanquesada.com`
5. Custom SSL certificate: choose the ACM cert from Step 3
6. Default root object: `index.html`
7. Create → wait ~10 min for deployment

## Step 5 — Point DNS at CloudFront (Route 53)

1. Go to Route 53 → your hosted zone for `dylanquesada.com`
2. Create **A record** (Alias):
   - Name: `dylanquesada.com`
   - Route traffic to: **Alias to CloudFront distribution** → select your distribution
3. Repeat for `www.dylanquesada.com` (CNAME → CloudFront domain)

## Step 6 — Deploy updates

```bash
# After editing files, sync and invalidate the CloudFront cache
aws s3 sync . s3://dylanquesada.com \
  --exclude "*.md" \
  --exclude ".git/*" \
  --delete

aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Estimated cost
- S3: ~$0.02/mo (tiny static files)
- CloudFront: free tier covers 1TB/mo + 10M requests/mo
- Route 53 hosted zone: $0.50/mo
- ACM certificate: free

**Total: ~$0.50–$1/month**
