# Payment Flow Guide - Frontend

## Overview

Complete payment flow implementation for Sepay integration with Next.js frontend.

## File Structure

```
src/
├── app/(main)/
│   ├── subscription/
│   │   └── page.tsx              # Subscription plans listing
│   └── payment/
│       ├── checkout/
│       │   └── page.tsx          # Checkout form submission
│       ├── success/
│       │   └── page.tsx          # Payment success page
│       ├── error/
│       │   └── page.tsx          # Payment error page
│       └── cancel/
│           └── page.tsx          # Payment cancelled page
└── components/
    └── payment/
        └── CheckoutForm.tsx      # Reusable checkout form component
```

## Flow Diagram

```
1. User visits /subscription
   ↓
2. Selects a plan and clicks "Subscribe Now"
   ↓
3. Frontend calls POST /subscription/payment/checkout
   ↓
4. Backend returns checkout data with signed form fields
   ↓
5. Frontend redirects to /payment/checkout
   ↓
6. CheckoutForm auto-submits form to Sepay
   ↓
7. User completes payment on Sepay
   ↓
8. Sepay redirects to:
   - /payment/success (if successful)
   - /payment/error (if failed)
   - /payment/cancel (if cancelled)
   ↓
9. Success page polls /subscription/payment/status/:transactionId
   ↓
10. Subscription activated, user redirected to dashboard
```

## Components

### 1. Subscription Page (`/subscription`)

**Purpose:** Display available subscription plans and current subscription status

**Features:**

- Lists all available plans with pricing and features
- Shows current active subscription (if any)
- Initiates checkout when user selects a plan
- Handles loading and error states

**Key Functions:**

- `fetchPlans()`: Get all available subscription plans
- `fetchSubscription()`: Get current user subscription
- `handleCheckout(planId)`: Initiate payment checkout

**API Calls:**

```
GET /subscription/plans
GET /subscription/current
POST /subscription/payment/checkout
```

### 2. Checkout Page (`/payment/checkout`)

**Purpose:** Prepare and submit payment form to Sepay

**Features:**

- Retrieves checkout data from session storage
- Passes data to CheckoutForm component
- Handles checkout data validation

**Data Flow:**

1. Receives checkout data from subscription page
2. Stores in session storage
3. Passes to CheckoutForm for submission

### 3. CheckoutForm Component

**Purpose:** Auto-submit form to Sepay checkout endpoint

**Features:**

- Creates hidden form with all required fields
- Auto-submits after component mounts
- Provides manual submit button as fallback
- Shows loading state during submission

**Form Fields:**

```
- merchant: Merchant ID
- operation: 'PURCHASE'
- payment_method: 'BANK_TRANSFER'
- order_invoice_number: Transaction UUID
- order_amount: Payment amount
- currency: 'VND'
- order_description: Plan description
- customer_id: User ID
- success_url: Redirect on success
- error_url: Redirect on error
- cancel_url: Redirect on cancel
- signature: HMAC-SHA256 signature
```

### 4. Success Page (`/payment/success`)

**Purpose:** Confirm successful payment and activate subscription

**Features:**

- Polls payment status from backend
- Displays subscription details
- Shows success message with plan information
- Provides navigation to dashboard

**API Calls:**

```
GET /subscription/payment/status/:transactionId
```

**Displays:**

- Plan name and duration
- Storage limit
- Subscription start and end dates
- Success confirmation

### 5. Error Page (`/payment/error`)

**Purpose:** Handle payment failures

**Features:**

- Displays error message
- Shows transaction ID for reference
- Provides retry and dashboard navigation options

**Query Parameters:**

- `message`: Error message from Sepay
- `transactionId`: Transaction ID for reference

### 6. Cancel Page (`/payment/cancel`)

**Purpose:** Handle user cancellation

**Features:**

- Displays cancellation message
- Provides retry and dashboard navigation options
- No subscription activation

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Integration

### Checkout Initiation

**Request:**

```typescript
POST /subscription/payment/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": "plan-uuid"
}
```

**Response:**

```typescript
{
  "status": "PENDING",
  "transactionId": "transaction-uuid",
  "checkoutUrl": "https://pay-sandbox.sepay.vn/v1/checkout/init",
  "formData": {
    "merchant": "MERCHANT_ID",
    "operation": "PURCHASE",
    "payment_method": "BANK_TRANSFER",
    "order_invoice_number": "transaction-uuid",
    "order_amount": 100000,
    "currency": "VND",
    "order_description": "Subscription: Premium 100GB",
    "customer_id": "user-uuid",
    "success_url": "https://app.example.com/payment/success",
    "error_url": "https://app.example.com/payment/error",
    "cancel_url": "https://app.example.com/payment/cancel",
    "signature": "base64-encoded-signature"
  },
  "subscription": {
    "id": "subscription-uuid",
    "planName": "Premium 100GB",
    "amount": 100000,
    "durationDays": 30
  }
}
```

### Payment Status Check

**Request:**

```typescript
GET /subscription/payment/status/:transactionId
Authorization: Bearer {token}
```

**Response:**

```typescript
{
  "transactionId": "transaction-uuid",
  "status": "SUCCESS|FAILED|PENDING",
  "amount": 100000,
  "paidAt": "2024-01-15T10:30:00Z",
  "subscription": {
    "id": "subscription-uuid",
    "isActive": true,
    "startDate": "2024-01-15T10:30:00Z",
    "endDate": "2024-02-14T10:30:00Z",
    "plan": {
      "id": "plan-uuid",
      "name": "Premium 100GB",
      "price": 100000,
      "durationDays": 30,
      "storageLimit": 100
    }
  }
}
```

## User Flow

### Happy Path (Successful Payment)

1. User navigates to `/subscription`
2. Sees available plans and current subscription (if any)
3. Clicks "Subscribe Now" on desired plan
4. Frontend calls checkout API
5. Redirected to `/payment/checkout`
6. Form auto-submits to Sepay
7. User completes payment on Sepay
8. Sepay redirects to `/payment/success?transactionId=xxx`
9. Success page polls status and displays confirmation
10. User clicks "Go to Dashboard"

### Error Path

1. Payment fails on Sepay
2. Sepay redirects to `/payment/error?message=xxx&transactionId=xxx`
3. User sees error message
4. Can click "Try Again" to return to subscription page

### Cancellation Path

1. User cancels payment on Sepay
2. Sepay redirects to `/payment/cancel`
3. User sees cancellation message
4. Can click "Try Again" to return to subscription page

## Security Considerations

1. **Token Storage:** Auth token stored in localStorage
2. **Session Storage:** Checkout data stored in session storage (cleared on tab close)
3. **Signature Verification:** Backend generates HMAC-SHA256 signature
4. **HTTPS Only:** All API calls should use HTTPS in production
5. **CORS:** Configure CORS properly for API calls

## Error Handling

### Frontend Error Handling

- Network errors: Display error message and retry option
- Invalid checkout data: Redirect to subscription page
- Payment status check failures: Show error with retry option
- Missing transaction ID: Display error page

### Backend Error Handling

- Invalid plan ID: Return 404
- Unauthorized access: Return 401
- Transaction not found: Return 404
- Webhook verification failure: Return 401

## Testing

### Local Testing

1. Set `SEPAY_ENV=sandbox` in backend `.env`
2. Use sandbox merchant credentials
3. Test with sandbox payment methods
4. Verify redirect URLs are accessible

### Test Scenarios

1. **Successful Payment:**
    - Complete payment flow
    - Verify subscription activation
    - Check storage quota granted

2. **Failed Payment:**
    - Attempt payment with invalid card
    - Verify error page displays
    - Verify subscription not activated

3. **Cancelled Payment:**
    - Cancel payment on Sepay
    - Verify cancel page displays
    - Verify subscription not activated

4. **Status Polling:**
    - Check payment status multiple times
    - Verify status updates correctly
    - Verify subscription details display

## Troubleshooting

### Form Not Submitting

- Check browser console for errors
- Verify checkout URL is correct
- Check form fields are properly populated
- Try manual submit button

### Payment Status Not Updating

- Verify transaction ID is correct
- Check API endpoint is accessible
- Verify auth token is valid
- Check network tab for API errors

### Redirect Not Working

- Verify redirect URLs in environment variables
- Check browser allows redirects
- Verify Sepay webhook is configured
- Check backend logs for webhook errors

## Future Enhancements

1. Add payment method selection (BANK_TRANSFER, NAPAS_BANK_TRANSFER)
2. Implement subscription renewal reminders
3. Add payment history page
4. Implement subscription cancellation
5. Add promotional code support
6. Implement payment retry logic
7. Add email notifications for payment status
