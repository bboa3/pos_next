# User Guide: Wallet & Loyalty Points System

---

## Overview

The Wallet & Loyalty system allows customers to:
- Earn points on every purchase
- Automatically convert points to wallet balance
- Use wallet balance to pay at POS

**Flow:**
```
Customer Purchase → Earn Points → Auto-Convert to Wallet → Use for Future Purchases
```

---

## Step-by-Step Setup

---

### Step 1: Create Loyalty Program

1. Go to **Selling > Loyalty Program**

2. Click **New** to create a new program

3. Fill in the following fields:

   | Field | Value |
   |-------|-------|
   | Loyalty Program Name | POS Rewards Program |
   | Company | Select your company |
   | Auto Opt In | ✓ Enabled |
   | From Date | Today's date |

4. In **Collection Rules** section, add:

   | Tier Name | Min Spent | Collection Factor |
   |-----------|-----------|-------------------|
   | Base | 0 | 1 |

   > **Collection Factor**: Points per currency unit. Factor of 1 = 1 point per SAR spent

5. Click **Save**

---

### Step 2: Create Wallet Account

1. Go to **Accounting > Chart of Accounts**

2. Find **Receivables** under Assets

3. Click **Add Child** to add a sub-account

4. Enter the details:

   | Field | Value |
   |-------|-------|
   | Account Name | Customer Wallet |
   | Account Type | Receivable |
   | Is Group | No |

5. Click **Create New**

---

### Step 3: Create Wallet Payment Method

1. Go to **Accounting > Mode of Payment**

2. Click **New** to create new payment method

3. Enter the details:

   | Field | Value |
   |-------|-------|
   | Mode of Payment | Redeem Points |
   | Type | General |
   | **Is Wallet Payment** | ✓ **Enabled** |

   > **Critical**: You MUST enable "Is Wallet Payment" checkbox

4. In **Accounts** table, add:

   | Company | Default Account |
   |---------|-----------------|
   | Your Company | Customer Wallet |

5. Click **Save**

---

### Step 4: Add Payment Method to POS Profile

1. Go to **Retail > POS Profile**

2. Open your POS Profile

3. In **Payment Methods** section, click **Add Row**

4. Add the payment method:

   | Mode of Payment | Default |
   |-----------------|---------|
   | Redeem Points | No |

5. Click **Save**

---

### Step 5: Configure POS Settings

1. Search for **POS Settings** in the awesomebar

2. If none exists, create new by clicking **New**

3. Fill in the settings:

   | Field | Value |
   |-------|-------|
   | POS Profile | Select your profile |
   | Enable Wallet | ✓ Enabled |
   | Wallet Account | Customer Wallet |
   | **Default Loyalty Program** | Select your loyalty program |
   | Auto Create Wallet | ✓ Enabled |
   | Loyalty to Wallet | ✓ Enabled |

   > **Default Loyalty Program**: New customers will automatically be enrolled in this program. Leave empty to disable auto-enrollment.
   >
   > **Conversion Rate**: Set in Loyalty Program → Redemption → Conversion Factor

4. Click **Save**

---

## How It Works

### Customer Enrollment

When a new customer is created:
1. Automatically enrolled in Loyalty Program (if Auto Opt In enabled)
2. Wallet automatically created (if Auto Create Wallet enabled)

### Earning Points

When a Sales Invoice is submitted:
```
Invoice Total: 500 SAR
Collection Factor: 1
Points Earned: 500 points
Conversion Rate: 1.0
Wallet Credit: 500 SAR
```

---

## Using Wallet in POS

### Viewing Balance

1. Open POS
2. Select customer
3. Open Payment Dialog
4. You'll see balance on "Redeem Points" button:
   ```
   🎁 Redeem Points ê 500.00
   ```

### Paying with Wallet

1. In Payment Dialog, click **Redeem Points**
2. Available balance is automatically applied
3. If balance insufficient, add another payment method
4. Complete the sale

### Partial Payment Example

```
Invoice Total: 800 SAR
Wallet Balance: 500 SAR

Payment 1: Redeem Points - 500 SAR
Payment 2: Cash - 300 SAR
Total: 800 SAR ✓
```

---

## Managing Wallets

### View Customer Wallets

1. Go to **POS Next > Wallet**
2. View list of all wallets with:
   - Customer name
   - Current balance
   - Status

### Add Manual Credit

1. Go to **POS Next > Wallet Transaction**
2. Click **New**
3. Fill in:

   | Field | Value |
   |-------|-------|
   | Wallet | Select customer wallet |
   | Transaction Type | Credit |
   | Amount | Amount to add |
   | Source Type | Manual Adjustment |
   | Remarks | Reason for credit |

4. Click **Save** then **Submit**

---

## Troubleshooting

### Customer not earning points

**Check:**
- Customer has loyalty program assigned
- "Auto Opt In" is enabled on Loyalty Program
- "Default Loyalty Program" is set in POS Settings

**Solution:**
- Open Customer record and check "Loyalty Program" field
- If empty, select the loyalty program and save
- For new customers: Set "Default Loyalty Program" in POS Settings for auto-enrollment

### Points not converting to wallet

**Check:**
- "Loyalty to Wallet" is enabled in POS Settings
- Customer has an active wallet

**Solution:**
- Verify POS Settings configuration
- Check Error Log for any conversion errors

### Wallet balance shows 0

**Check:**
- Wallet exists for customer
- Customer has made purchases and earned points

**Solution:**
- Customer needs to earn points first
- Or add manual credit via Wallet Transaction

### "Redeem Points" button disabled

**Causes:**
- Wallet balance is 0
- No wallet exists for customer
- Wallet feature is disabled in POS Settings

**Solution:**
- Customer needs to earn points first or receive manual credit
- Verify POS Settings has wallet enabled

---

## Quick Setup Checklist

- [ ] Create Loyalty Program with Auto Opt In enabled
- [ ] Create Customer Wallet account (Receivable type)
- [ ] Create "Redeem Points" payment method with Is Wallet Payment enabled
- [ ] Add payment method to POS Profile
- [ ] Configure POS Settings:
  - [ ] Set Default Loyalty Program (for auto-enrollment)
  - [ ] Enable Wallet and set Wallet Account
  - [ ] Enable Loyalty to Wallet conversion

---

## Support

For help, contact your system administrator or check the Error Log for detailed error messages.
