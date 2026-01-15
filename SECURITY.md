# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email us at: [security@example.com](mailto:security@example.com) (replace with your actual contact)
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Resolution**: We aim to resolve critical issues within 7 days
- **Disclosure**: We will coordinate with you on public disclosure timing

## Security Best Practices

### For Users

- Keep your API keys and environment variables secure
- Never commit `.env` files to version control
- Use strong, unique passwords for any accounts
- Keep dependencies updated

### For Contributors

- Never hardcode secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Validate and sanitize all user inputs
- Follow secure coding practices

## Known Security Considerations

### API Keys
- Groq API keys are stored in `.env` files (not committed)
- API keys are only used server-side in the backend

### Data Storage
- Portfolio data is stored locally in the browser (localStorage)
- No sensitive data is transmitted to external servers except for AI analysis features

### Third-Party Services
- Yahoo Finance API for stock prices
- Groq API for AI analysis
- ForexFactory for economic calendar data

## Dependencies

We regularly update dependencies to patch known vulnerabilities. Run `npm audit` to check for issues.

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix
```

## Contact

For security concerns, please contact the maintainers through:
- GitHub Security Advisories (preferred)
- Email: [your-email@example.com]

---

Thank you for helping keep Portfolio Tracker secure! 🔒
