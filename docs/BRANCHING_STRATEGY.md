# Branching Strategy

## Main Branches
- **main**: Production-ready code (protected)
- **dev**: Integration branch for features (protected)

## Feature Branches
Format: `feature/[name]-[short-description]`
Examples:
- `feature/tengyang-authentication-service`

## Branch Workflow

1. **Create Feature Branch**
```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/yourname-feature
```

2. **Work on Feature**
```bash
   # Make changes
   git add .
   git commit -m "Your commit message"
```

3. **Push to Remote**
```bash
   git push origin feature/yourname-feature
```

4. **Create Pull Request**
    - Go to GitHub repository
    - Click "Compare & pull request"
    - Base: `dev` ← Compare: `feature/yourname-feature`
    - Title: `Your Name And Feature Title`
    - Add description with what was done
    - Request review from team lead
    - Link Jira ticket

5. **After Approval**
    - Team lead merges PR
    - Delete feature branch
```bash
   git checkout dev
   git pull origin dev
   git branch -d feature/yourname-feature
```