# Policy-as-code (placeholder)

This folder will contain policy-as-code files (Rego/OPA or Conftest) that define access-control rules and other guardrails.

Suggested structure:

- `policy/rego/` — OPA Rego policies
- `policy/tests/` — test cases for policies
- `policy/README.md` — this file

CI should run these policies against Terraform, Kubernetes manifests, and critical JSON/YAML outputs where relevant.
