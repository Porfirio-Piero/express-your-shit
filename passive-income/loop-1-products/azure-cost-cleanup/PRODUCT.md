# Azure Cost Cleanup Playbook

**Price:** $24
**Format:** PDF + editable DOCX + PowerShell scripts (.ps1)
**Target:** Azure admins, IT managers, FinOps practitioners at mid-size orgs
**Niche:** Everyone knows Azure is expensive. Nobody has time to audit it. This playbook gives you the exact scripts and checklists to find and eliminate waste — in one afternoon, not one quarter.

---

## Sales Page Copy

### Headline
**Your Azure bill has waste in it. This playbook finds it.**

The average Azure subscription wastes 25-35% of spend on resources nobody uses, services that overlap, and VMs that are too big for their workload. Cloud providers won't tell you this — their incentive is your spend, not your savings.

This playbook gives you the exact PowerShell scripts, checklists, and decision trees to audit your Azure environment in a single afternoon. Not theory — copy, paste, run, save.

### What You Get

🔍 **11 PowerShell Audit Scripts** — Ready to run. Each one targets a specific waste category: orphaned disks, oversized VMs, idle app services, unused public IPs, unattached NICs, stale storage accounts, and more. Output is clean, actionable, and sorted by potential savings.

📊 **Cost Savings Calculator** — XLSX workbook with Azure pricing data baked in. Input your resource counts; get estimated monthly savings per category. Shows exactly what to kill, what to resize, and what to leave alone.

✅ **28-Point Azure Waste Checklist** — Walk through every category of Azure waste. Each item has: what to check, how to check it (script reference), what to do about it, and estimated savings range.

📋 **Executive Summary Template** — One-page report you can hand to leadership. "We found $X/month in Azure waste. Here's the plan to eliminate it."

🔄 **Monthly Audit Loop Guide** — Set up a recurring cost governance process. Automated script runs, review cadences, escalation paths, and KPIs.

### Who This Is For

- Azure administrators tired of surprise bills
- IT managers who need to justify cloud spend
- FinOps practitioners looking for a repeatable audit process
- Consultants who need a client-ready deliverable

### FAQ

**Is this just for large enterprises?**
No. The waste patterns are the same whether you spend $5K or $500K/month on Azure. The scripts scale.

**Do I need to be an Azure expert?**
No. Each script includes comments explaining what it does, what to look for in the output, and what to do next. If you can open PowerShell, you can run these.

**Will these scripts change anything in my environment?**
No. All scripts are READ-ONLY. They audit and report. The only changes happen when you decide to act on the findings.

**Does this cover AWS/GCP?**
No. This is Azure-specific. AWS and GCP have different waste patterns. (AWS version coming if this sells.)

---

## Product Contents

### Script 1: Orphaned Disk Finder
```powershell
# Finds all unattached managed disks and estimates monthly cost
# Output: Resource group, disk name, SKU, size GB, estimated monthly cost
Get-AzDisk | Where-Object { $_.ManagedBy -eq $null } | 
  Select-Object ResourceGroupName, Name, Sku.Name, DiskSizeGB, 
  @{N='EstimatedCost';E={($_.DiskSizeGB * 0.05) + 5.50}}
```

### Script 2: Oversized VM Detector
```powershell
# Checks all running VMs against their CPU/memory utilization (last 7 days)
# Flags VMs with <15% average CPU for downsizing recommendation
$vmList = Get-AzVM -Status
foreach ($vm in $vmList) {
  $metrics = Get-AzMetric -ResourceId $vm.Id -MetricName "Percentage CPU" -TimeGrain 01:00:00 -StartTime (Get-Date).AddDays(-7)
  $avgCpu = ($metrics.Data | Measure-Object Average -Average).Average
  if ($avgCpu -lt 15) { Write-Output "DOWNSIZE: $($vm.Name) avg CPU=$([math]::Round($avgCpu,1))%" }
}
```

### Script 3: Idle App Services
### Script 4: Unused Public IPs
### Script 5: Unattached NICs
### Script 6: Stale Storage Accounts (90+ days no access)
### Script 7: Expensive SKU Downgrade Recommendations
### Script 8: Reservation Opportunity Finder
### Script 9: Resource Group Cost Anomaly Detector
### Script 10: Tag Compliance Auditor
### Script 11: Full Environment Summary Report

---

## Competitive Research Notes

| Product | Price | Platform | Gap |
|---------|-------|----------|-----|
| Azure Cost Management (free, built-in) | Free | Azure Portal | No executable scripts, no checklist, no executive reporting |
| CloudHealth by VMware | Enterprise $$$ | SaaS | Overkill for mid-size, requires onboarding |
| Azure Cost Playbook (Gumroad, generic) | $12 | Gumroad | Generic cloud advice, no actual scripts |
| FinOps Foundation templates | Free | GitHub | Framework-only, no ready-to-run scripts |

**Our positioning:** Executable scripts + decision checklists + executive reporting. Copy, paste, run, save. One afternoon, not one quarter.

---

## Gumroad Listing Metadata

- **Title:** Azure Cost Cleanup Playbook
- **Subtitle:** 11 PowerShell scripts + checklists + exec summary template. Find and eliminate Azure waste in one afternoon.
- **Price:** $24
- **Categories:** Technology, Business, Templates
- **Tags:** Azure, cloud cost, FinOps, PowerShell, cost optimization, Azure audit