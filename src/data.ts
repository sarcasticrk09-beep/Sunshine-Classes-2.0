/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Student,
  Teacher,
  Admission,
  Course,
  Batch,
  ClassEntity,
  Attendance,
  FeeStatus,
  FeeReceipt,
  Test,
  StudentMark,
  Homework,
  HomeworkSubmission,
  BlogPost,
  Testimonial,
  Topper,
  FounderMember,
  InstituteStrength,
  StudyMaterial,
  GalleryItem,
  AppNotification,
  Inquiry,
  AuditLog,
  StudentSubscription,
  SubscriptionPayment,
  SubscriptionReceipt,
  SubscriptionNotification,
  SubscriptionConfig,
  TimetableEntry,
  EmailTemplatesConfig,
  WhatsAppTemplatesConfig,
  BatchBulletinPost
} from './types';

export const getFeeForClass = (classStr: string): number => {
  if (!classStr) return 700;
  const match = classStr.match(/\d+/);
  if (match) {
    const classNum = parseInt(match[0], 10);
    if (classNum >= 1 && classNum <= 4) return 500;
    if (classNum >= 5 && classNum <= 8) return 700;
    if (classNum === 9) return 1000;
    if (classNum === 10) return 1200;
  }
  return 700; // default backup fee
};

export const SEED_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Class 10 Board Specialists (Math, Science, English)',
    subjects: ['Mathematics', 'Science (Phy/Chem/Bio)', 'English Literature & Grammar', 'Social Studies'],
    duration: '1 Year (Full Session)',
    features: ['Weekly Doubt Clearing', 'Chapter-wise MCQ Tests', 'Previous 10 Years Board Papers', 'NCERT-Based Deep Dives'],
    fees: 1200
  },
  {
    id: 'c2',
    name: 'Class 9 Foundation Course (Science & Math focus)',
    subjects: ['Mathematics', 'Science', 'English'],
    duration: '1 Year (Full Session)',
    features: ['Strong concept building', 'Bi-weekly tests', 'Daily revision notes', 'Parent monthly meetups'],
    fees: 1000
  },
  {
    id: 'c3',
    name: 'Classes 5 to 8 Apex Learning',
    subjects: ['Mathematics', 'Science', 'English', 'Sanskrit/Hindi'],
    duration: '1 Year',
    features: ['Interactive modules', 'Doubt clinics', 'Regular assessment reports'],
    fees: 700
  },
  {
    id: 'c4',
    name: 'Classes 1 to 4 Junior Sunshine',
    subjects: ['All Primary Subjects (NCERT)'],
    duration: '1 Year',
    features: ['Special attention', 'Interactive homework', 'Creative writing classes'],
    fees: 500
  }
];

export const SEED_BATCHES: Batch[] = [
  { id: 'b1', name: 'Class 10 - Morning', time: '07:00 AM - 09:30 AM', class: 'Class 10', teacherName: 'Priyanshu Gupta', monthlyFee: 1200, startDate: '2026-06-01', billingCycle: 'Monthly', nextDueDate: '2026-07-01', status: 'ACTIVE' },
  { id: 'b2', name: 'Class 10 - Evening', time: '04:00 PM - 06:30 PM', class: 'Class 10', teacherName: 'Priyanshu Gupta', monthlyFee: 1200, startDate: '2026-06-01', billingCycle: 'Monthly', nextDueDate: '2026-07-01', status: 'ACTIVE' },
  { id: 'b3', name: 'Class 9 - Evening', time: '03:00 PM - 05:00 PM', class: 'Class 9', teacherName: 'Anil Pandey', monthlyFee: 1000, startDate: '2026-06-01', billingCycle: 'Monthly', nextDueDate: '2026-07-01', status: 'ACTIVE' },
  { id: 'b4', name: 'Class 8 - Afternoon', time: '02:00 PM - 04:00 PM', class: 'Class 8', teacherName: 'Ritu Singh', monthlyFee: 700, startDate: '2026-05-15', billingCycle: 'Monthly', nextDueDate: '2026-06-15', status: 'DUE' },
  { id: 'b5', name: 'Class 6 - Morning', time: '07:00 AM - 09:00 AM', class: 'Class 6', teacherName: 'Neha Sharma', monthlyFee: 700, startDate: '2026-06-01', billingCycle: 'Monthly', nextDueDate: '2026-07-01', status: 'ACTIVE' }
];

export const SEED_CLASSES: ClassEntity[] = [
  {
    id: 'cls-6',
    name: 'Class 6',
    code: 'C06',
    defaultMonthlyFee: 700,
    capacity: 40,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    assignedTeachers: ['Neha Sharma', 'Ritu Singh'],
    timings: [
      { id: 'ct-6-1', label: 'Morning', timeRange: '07:00 AM – 09:00 AM', teachers: ['Neha Sharma'], capacity: 20, enrolledCount: 10, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-6-2', label: 'Afternoon', timeRange: '02:00 PM – 04:00 PM', teachers: ['Ritu Singh'], capacity: 20, enrolledCount: 12, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-7',
    name: 'Class 7',
    code: 'C07',
    defaultMonthlyFee: 700,
    capacity: 40,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    assignedTeachers: ['Ritu Singh'],
    timings: [
      { id: 'ct-7-1', label: 'Morning', timeRange: '07:00 AM – 09:00 AM', teachers: ['Ritu Singh'], capacity: 20, enrolledCount: 14, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-7-2', label: 'Evening', timeRange: '04:00 PM – 06:00 PM', teachers: ['Ritu Singh'], capacity: 20, enrolledCount: 11, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-8',
    name: 'Class 8',
    code: 'C08',
    defaultMonthlyFee: 700,
    capacity: 40,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    assignedTeachers: ['Ritu Singh'],
    timings: [
      { id: 'ct-8-1', label: 'Afternoon', timeRange: '02:00 PM – 04:00 PM', teachers: ['Ritu Singh'], capacity: 40, enrolledCount: 22, status: 'ACTIVE', section: 'Section A' }
    ]
  },
  {
    id: 'cls-9',
    name: 'Class 9',
    code: 'C09',
    defaultMonthlyFee: 1000,
    capacity: 45,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Anil Pandey'],
    timings: [
      { id: 'ct-9-1', label: 'Evening', timeRange: '03:00 PM – 05:00 PM', teachers: ['Anil Pandey'], capacity: 45, enrolledCount: 28, status: 'ACTIVE', section: 'Section A' }
    ]
  },
  {
    id: 'cls-10',
    name: 'Class 10',
    code: 'C10',
    defaultMonthlyFee: 1200,
    capacity: 80,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Priyanshu Gupta'],
    timings: [
      { id: 'ct-10-1', label: 'Morning', timeRange: '07:00 AM – 09:30 AM', teachers: ['Priyanshu Gupta'], capacity: 40, enrolledCount: 25, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-10-2', label: 'Evening', timeRange: '04:00 PM – 06:30 PM', teachers: ['Priyanshu Gupta'], capacity: 40, enrolledCount: 32, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-11',
    name: 'Class 11',
    code: 'C11',
    defaultMonthlyFee: 1500,
    capacity: 50,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    stream: 'Science',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Anil Pandey', 'Priyanshu Gupta'],
    timings: [
      { id: 'ct-11-1', label: 'Morning', timeRange: '07:30 AM – 10:00 AM', teachers: ['Priyanshu Gupta'], capacity: 25, enrolledCount: 18, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-11-2', label: 'Evening', timeRange: '05:00 PM – 07:30 PM', teachers: ['Anil Pandey'], capacity: 25, enrolledCount: 15, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-12',
    name: 'Class 12',
    code: 'C12',
    defaultMonthlyFee: 1500,
    capacity: 50,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    stream: 'Science',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Anil Pandey', 'Priyanshu Gupta'],
    timings: [
      { id: 'ct-12-1', label: 'Morning', timeRange: '07:30 AM – 10:00 AM', teachers: ['Anil Pandey'], capacity: 25, enrolledCount: 20, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-12-2', label: 'Evening', timeRange: '05:00 PM – 07:30 PM', teachers: ['Priyanshu Gupta'], capacity: 25, enrolledCount: 22, status: 'ACTIVE', section: 'Section B' }
    ]
  }
];

export const SEED_STUDENT_SUBSCRIPTIONS: StudentSubscription[] = [
  {
    id: 'sub1',
    studentId: 's1',
    studentName: 'Rahul Verma',
    admissionNo: 'SC-1001',
    batchId: 'b2',
    batchName: 'Class 10 - Evening Stars',
    monthlyFee: 1200,
    startDate: '2026-06-01',
    billingCycle: 'Monthly',
    nextDueDate: '2026-07-01',
    status: 'ACTIVE',
    daysRemaining: 4,
    lastPaymentDate: '2026-06-02',
    gracePeriodDays: 5
  },
  {
    id: 'sub2',
    studentId: 's2',
    studentName: 'Priya Mishra',
    admissionNo: 'SC-1002',
    batchId: 'b2',
    batchName: 'Class 10 - Evening Stars',
    monthlyFee: 1200,
    startDate: '2026-06-01',
    billingCycle: 'Monthly',
    nextDueDate: '2026-06-25',
    status: 'OVERDUE',
    daysRemaining: -2,
    lastPaymentDate: '2026-05-24',
    gracePeriodDays: 5
  },
  {
    id: 'sub3',
    studentId: 's3',
    studentName: 'Aditya Gupta',
    admissionNo: 'SC-1003',
    batchId: 'b3',
    batchName: 'Class 9 - Foundation Group',
    monthlyFee: 1000,
    startDate: '2026-06-01',
    billingCycle: 'Monthly',
    nextDueDate: '2026-06-15',
    status: 'EXPIRED',
    daysRemaining: -12,
    lastPaymentDate: '2026-05-14',
    gracePeriodDays: 5
  },
  {
    id: 'sub4',
    studentId: 's4',
    studentName: 'Shreya Tiwari',
    admissionNo: 'SC-1004',
    batchId: 'b1',
    batchName: 'Class 10 - Morning Excellence',
    monthlyFee: 1200,
    startDate: '2026-06-01',
    billingCycle: 'Monthly',
    nextDueDate: '2026-06-30',
    status: 'DUE_SOON',
    daysRemaining: 3,
    lastPaymentDate: '2026-05-30',
    gracePeriodDays: 5
  }
];

export const SEED_SUBSCRIPTION_PAYMENTS: SubscriptionPayment[] = [
  {
    id: 'PAY-1001',
    subscriptionId: 'sub1',
    studentId: 's1',
    studentName: 'Rahul Verma',
    admissionNo: 'SC-1001',
    batchId: 'b2',
    batchName: 'Class 10 - Evening Stars',
    month: 'June 2026',
    amountPaid: 1200,
    paymentMethod: 'UPI',
    transactionId: 'UPI983104820491',
    paymentDate: '2026-06-02',
    status: 'SUCCESS'
  },
  {
    id: 'PAY-1002',
    subscriptionId: 'sub2',
    studentId: 's2',
    studentName: 'Priya Mishra',
    admissionNo: 'SC-1002',
    batchId: 'b2',
    batchName: 'Class 10 - Evening Stars',
    month: 'May 2026',
    amountPaid: 1200,
    paymentMethod: 'CASH',
    transactionId: 'CASH9401824',
    paymentDate: '2026-05-24',
    status: 'SUCCESS'
  },
  {
    id: 'PAY-1003',
    subscriptionId: 'sub3',
    studentId: 's3',
    studentName: 'Aditya Gupta',
    admissionNo: 'SC-1003',
    batchId: 'b3',
    batchName: 'Class 9 - Foundation Group',
    month: 'May 2026',
    amountPaid: 1000,
    paymentMethod: 'CARD',
    transactionId: 'TXN49310582',
    paymentDate: '2026-05-14',
    status: 'SUCCESS'
  },
  {
    id: 'PAY-1004',
    subscriptionId: 'sub4',
    studentId: 's4',
    studentName: 'Shreya Tiwari',
    admissionNo: 'SC-1004',
    batchId: 'b1',
    batchName: 'Class 10 - Morning Excellence',
    month: 'May 2026',
    amountPaid: 1200,
    paymentMethod: 'NET_BANKING',
    transactionId: 'TXN50210482',
    paymentDate: '2026-05-30',
    status: 'SUCCESS'
  }
];

export const SEED_SUBSCRIPTION_RECEIPTS: SubscriptionReceipt[] = [
  {
    id: 'REC-SUBS-101',
    paymentId: 'PAY-1001',
    studentId: 's1',
    studentName: 'Rahul Verma',
    admissionNo: 'SC-1001',
    batchName: 'Class 10 - Evening Stars',
    paymentMonth: 'June 2026',
    amountPaid: 1200,
    transactionId: 'TXN8491049210',
    paymentMethod: 'UPI',
    paymentDate: '2026-06-02'
  },
  {
    id: 'REC-SUBS-102',
    paymentId: 'PAY-1002',
    studentId: 's2',
    studentName: 'Priya Mishra',
    admissionNo: 'SC-1002',
    batchName: 'Class 10 - Evening Stars',
    paymentMonth: 'May 2026',
    amountPaid: 1200,
    transactionId: 'CASH9401824',
    paymentMethod: 'CASH',
    paymentDate: '2026-05-24'
  },
  {
    id: 'REC-SUBS-103',
    paymentId: 'PAY-1003',
    studentId: 's3',
    studentName: 'Aditya Gupta',
    admissionNo: 'SC-1003',
    batchName: 'Class 9 - Foundation Group',
    paymentMonth: 'May 2026',
    amountPaid: 1000,
    transactionId: 'TXN49310582',
    paymentMethod: 'CARD',
    paymentDate: '2026-05-14'
  },
  {
    id: 'REC-SUBS-104',
    paymentId: 'PAY-1004',
    studentId: 's4',
    studentName: 'Shreya Tiwari',
    admissionNo: 'SC-1004',
    batchName: 'Class 10 - Morning Excellence',
    paymentMonth: 'May 2026',
    amountPaid: 1200,
    transactionId: 'TXN50210482',
    paymentMethod: 'NET_BANKING',
    paymentDate: '2026-05-30'
  }
];

export const SEED_SUBSCRIPTION_NOTIFICATIONS: SubscriptionNotification[] = [
  {
    id: 'notif-sub-1',
    studentId: 's2',
    studentName: 'Priya Mishra',
    title: 'Fee Payment Due Soon',
    content: 'Dear Priya Mishra, your monthly subscription fee of ₹1200 for Class 10 - Evening Stars is due on 2026-06-25.',
    date: '2026-06-18',
    type: 'REMINDER_7_DAYS',
    status: 'SENT',
    channel: 'DASHBOARD'
  },
  {
    id: 'notif-sub-2',
    studentId: 's2',
    studentName: 'Priya Mishra',
    title: 'Urgent: Subscription Overdue',
    content: 'Dear Priya Mishra, your monthly fee is overdue since 2026-06-25. Please pay soon to avoid service expiry!',
    date: '2026-06-26',
    type: 'REMINDER_OVERDUE',
    status: 'SENT',
    channel: 'DASHBOARD'
  },
  {
    id: 'notif-sub-3',
    studentId: 's3',
    studentName: 'Aditya Gupta',
    title: 'Subscription EXPIRED',
    content: 'Dear Aditya Gupta, your subscription has EXPIRED since 2026-06-20 (grace period over). Standard resources are now locked until payment.',
    date: '2026-06-21',
    type: 'REMINDER_OVERDUE',
    status: 'SENT',
    channel: 'DASHBOARD'
  }
];

export const SEED_SUBSCRIPTION_CONFIG: SubscriptionConfig = {
  billingDate: 1,
  gracePeriod: 5,
  lateFee: 50,
  enableOverdueSMS: true,
  enableMidGraceSMS: true,
  enableExpiryWarningSMS: false,
  enableExpiredSMS: true,
  whatsappProvider: 'NONE',
  whatsappApiKey: '',
  whatsappPhoneNumber: '',
  whatsappAccountSid: '',
  whatsappAuthToken: '',
  whatsappSenderNumber: '',
  enableOnlinePayments: true,
  paymentGatewayProvider: 'UPI_QR',
  upiId: 'sunshineclasses@upi',
  upiMerchantName: 'Sunshine Classes Ltd',
  bankAccountHolder: 'Sunshine Classes ERP Solutions',
  bankAccountNumber: '33888542347',
  bankName: 'State Bank of India (Pihani Branch)',
  bankIfsc: 'SBIN0011180',
  razorpayKeyId: 'rzp_live_A9B8C7D6E5F4G3',
  stripePublicKey: 'pk_live_51Mxxxxxxxxxxxxxxxx',
  allowPartialPayments: false,
  requireReceiptUpload: true,
  convenienceFeePercent: 0,
  enableUpiMethod: true,
  enableCardMethod: true,
  enableNetBankingMethod: true,
  enableBankTransferMethod: true,
  enableAutomatedFeeAlerts: true,
  // New payment settings requested
  enableUpiPayments: true,
  coachingUpiId: "9161586254@upi",
  accountHolderName: "Sunshine Classes",
  paymentInstructions: "Please scan the QR code using any UPI App (Google Pay, PhonePe, Paytm, BHIM) or click 'Pay' if on mobile. After successful payment, please enter the correct 12-digit UPI UTR number and optionally upload the screenshot. Do not submit a dummy or incorrect UTR, as it will be rejected upon admin verification.",
  paymentVerificationTimeLimit: 24,
  receiptPrefix: "SUN-REC-",
  emailReceiptToggle: true,
  studentNotificationToggle: true
};

export const SEED_WHATSAPP_TEMPLATES: WhatsAppTemplatesConfig = {
  receiptTemplate: "Dear Parent, Sunshine Classes has received payment of ₹{{amount}} for {{studentName}} ({{className}}) for the month of {{month}}. Receipt ID: {{receiptId}}. Thank you!",
  reminderTemplate: "Dear Parent, the monthly tuition fee of ₹{{amount}} for {{studentName}} ({{className}}) is pending for {{month}}. Please pay before the due date {{dueDate}} to avoid late fees. Thank you, Sunshine Classes.",
  scheduleTemplate: "Hello {{studentName}}, please note that your batch timing for {{className}} has been adjusted. New timing: {{timing}}. Sunshine Classes."
};

export const SEED_EMAIL_TEMPLATES: EmailTemplatesConfig = {
  receiptSubject: "🧾 Fee Receipt - {{receiptId}} - Sunshine Classes",
  receiptBody: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800;">SUNSHINE CLASSES</h1>
    <p style="color: #ea580c; font-size: 12px; font-weight: bold; margin: 5px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">Excellence in Education</p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ea580c;">
    <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #334155;">Official Tuition Fee Receipt</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Receipt No:</td>
        <td style="padding: 4px 0; text-align: right;">{{receiptId}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Date:</td>
        <td style="padding: 4px 0; text-align: right;">{{date}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Student Name:</td>
        <td style="padding: 4px 0; text-align: right;">{{studentName}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Class / Grade:</td>
        <td style="padding: 4px 0; text-align: right;">{{className}}</td>
      </tr>
    </table>
  </div>

  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <th style="padding: 8px 0; text-align: left; color: #334155;">Description</th>
        <th style="padding: 8px 0; text-align: right; color: #334155;">Amount</th>
      </tr>
      <tr>
        <td style="padding: 10px 0;">Tuition Fee - Cycle <strong>{{month}}</strong></td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1e3a8a; font-size: 15px;">₹{{amount}}</td>
      </tr>
    </table>
  </div>

  <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #64748b; margin-bottom: 20px;">
    <tr>
      <td><strong>Payment Method:</strong> {{paymentMethod}}</td>
      <td style="text-align: right;"><strong>Ref / Transaction ID:</strong> {{transactionId}}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top: 8px;"><strong>Received By:</strong> {{receivedBy}}</td>
    </tr>
  </table>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
    <p style="margin: 0;">Thank you for your valuable support toward excellence in education.</p>
    <p style="margin: 5px 0 0 0; font-weight: bold; color: #475569;">Sunshine Classes, Pihani, Hardoi, UP, India</p>
    <p style="margin: 2px 0 0 0;">WhatsApp: +91 9999900001 | Call: +91 9999900002</p>
  </div>
</div>`,
  reminderSubject: "⚠️ Sunshine Classes - Tuition Fee Pending Reminder ({{month}})",
  reminderBody: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fecaca; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800;">SUNSHINE CLASSES</h1>
    <p style="color: #ea580c; font-size: 12px; font-weight: bold; margin: 5px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">Excellence in Education</p>
  </div>
  
  <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
    <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #b45309;">⚠️ Tuition Fee Payment Reminder</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 15px 0;">
      Dear Parent, 
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 15px 0;">
      We would like to remind you that the tuition fee for your child <strong>{{studentName}}</strong> ({{className}}) for the cycle <strong>{{month}}</strong> of <strong>₹{{amount}}</strong> is currently outstanding.
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0;">
      Please make the payment by the due date of <strong>{{dueDate}}</strong> to prevent late fines or study disruption. Thank you!
    </p>
  </div>

  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f8fafc;">
    <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; tracking: 0.5px; color: #64748b;">Dues Summary</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Student Name:</td>
        <td style="padding: 4px 0; text-align: right;">{{studentName}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Class / Grade:</td>
        <td style="padding: 4px 0; text-align: right;">{{className}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Pending Month:</td>
        <td style="padding: 4px 0; text-align: right;">{{month}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-weight: bold;">Due Date:</td>
        <td style="padding: 4px 0; text-align: right;">{{dueDate}}</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="padding: 8px 0; font-weight: bold; color: #b45309;">Pending Dues:</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #dc2626; font-size: 16px;">₹{{amount}}</td>
      </tr>
    </table>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
    <p style="margin: 0;">If you have already paid, please ignore this email or present your previous receipt.</p>
    <p style="margin: 5px 0 0 0; font-weight: bold; color: #475569;">Sunshine Classes, Pihani, Hardoi, UP, India</p>
    <p style="margin: 2px 0 0 0;">WhatsApp: +91 9999900001 | Call: +91 9999900002</p>
  </div>
</div>`
};

export const SEED_TEACHERS: Teacher[] = [
  {
    id: 't1',
    userId: 'u2',
    name: 'Priyanshu Gupta (Teacher)',
    email: 'teacher@sunshineclasses.net',
    phone: '9999900004',
    qualification: 'M.Sc. Mathematics, B.Ed',
    specialty: ['Mathematics', 'Physics'],
    batches: ['Class 10 - Morning Excellence']
  }
];

export const SEED_STUDENTS: Student[] = [
  {
    id: 's1',
    userId: 'u4',
    rollNo: 'SC-1001',
    name: 'Rahul Verma',
    class: 'Class 10 Board Specialists',
    fatherName: 'Ram Pal Verma',
    motherName: 'Shanti Devi',
    dob: '2011-05-15',
    gender: 'Male',
    address: '123 Education Lane, Pihani, Hardoi, UP',
    mobile: '9999900005',
    whatsapp: '9999900005',
    parentMobile: '9999900006',
    email: 'student@sunshineclasses.net',
    preferredBatch: 'Class 10 - Morning Excellence',
    preferredTiming: '07:00 AM - 09:30 AM',
    admissionDate: '2025-04-10',
    attendancePercentage: 92,
    status: 'ACTIVE'
  }
];

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    username: 'founder',
    name: 'Priyanshu Gupta (Founder)',
    email: 'sunshineclassespihani@gmail.com',
    role: 'SUPER_ADMIN',
    phone: '9999900000',
    password: 'Founder@Sunshine2026',
    passwordHash: 'Founder@Sunshine2026',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  },
  {
    id: 'u8',
    username: 'cofounder',
    name: 'Rajeev Kr. Verma (Co-Founder)',
    email: 'kumarvermarajeev79@gmail.com',
    role: 'SUPER_ADMIN',
    phone: '9999900001',
    password: 'Cofounder@Sunshine2026',
    passwordHash: 'Cofounder@Sunshine2026',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  },
  {
    id: 'u-superadmin',
    username: 'superadmin',
    name: 'Super Admin',
    email: 'superadmin@sunshineclasses.net',
    role: 'SUPER_ADMIN',
    phone: '9999911111',
    password: 'Sunshine@123',
    passwordHash: 'Sunshine@123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  },
  {
    id: 'u-admin',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@sunshineclasses.net',
    role: 'ADMIN',
    phone: '9999922222',
    password: 'Admin@123',
    passwordHash: 'Admin@123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  },
  {
    id: 'u-teacher',
    username: 'teacher',
    name: 'Priyanshu Gupta (Teacher)',
    email: 'teacher@sunshineclasses.net',
    role: 'TEACHER',
    phone: '9999900004',
    password: 'Teacher@123',
    passwordHash: 'Teacher@123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  },
  {
    id: 'u-reception',
    username: 'reception',
    name: 'Receptionist User',
    email: 'reception@sunshineclasses.net',
    role: 'RECEPTIONIST',
    phone: '9999933333',
    password: 'Reception@123',
    passwordHash: 'Reception@123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  },
  {
    id: 'u-student',
    username: 'student',
    name: 'Rahul Verma',
    email: 'student@sunshineclasses.net',
    role: 'STUDENT',
    phone: '9999900005',
    password: 'Student@123',
    passwordHash: 'Student@123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false
  }
];

export const SEED_ADMISSIONS: Admission[] = [];

export const SEED_ATTENDANCE: Attendance[] = [
  // Attendance history for s1 (Rahul)
  { id: 'at1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-24', status: 'PRESENT', markedBy: 'Priyanshu Gupta' },
  { id: 'at2', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-25', status: 'PRESENT', markedBy: 'Priyanshu Gupta' },
  { id: 'at3', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-26', status: 'LATE', markedBy: 'Priyanshu Gupta' },
  { id: 'at4', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-27', status: 'PRESENT', markedBy: 'Priyanshu Gupta' }
];

export const SEED_FEE_STATUS: FeeStatus[] = [
  { id: 'fs1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', month: 'June 2026', totalFee: 1200, discount: 0, scholarship: 0, paidFee: 0, pendingFee: 1200, status: 'PENDING', dueDate: '2026-06-10' },
  { id: 'fs2', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', month: 'July 2026', totalFee: 1200, discount: 0, scholarship: 0, paidFee: 0, pendingFee: 1200, status: 'PENDING', dueDate: '2026-07-10' }
];

export const SEED_FEE_RECEIPTS: FeeReceipt[] = [];

export const SEED_TESTS: Test[] = [
  { id: 'tst1', title: 'Mathematics Chapter 1 & 2', class: 'Class 10', subject: 'Mathematics', chapter: 'Real Numbers & Polynomials', totalMarks: 50, date: '2026-06-15', highestMarks: 49, averageMarks: 38 },
  { id: 'tst2', title: 'Science Mechanics Test', class: 'Class 10', subject: 'Science', chapter: 'Light Reflection & Refraction', totalMarks: 30, date: '2026-06-20', highestMarks: 28, averageMarks: 22 },
  { id: 'tst3', title: 'English Grammar Assessment', class: 'Class 10', subject: 'English', chapter: 'Tenses & Active-Passive Voice', totalMarks: 25, date: '2026-06-22', highestMarks: 24, averageMarks: 18 }
];

export const SEED_STUDENT_MARKS: StudentMark[] = [
  // Math Test (tst1) results
  { id: 'm1', testId: 'tst1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', marksObtained: 46, remarks: 'Excellent logical skills. Keep it up!', rank: 1 },
  // Science Test (tst2) results
  { id: 'm4', testId: 'tst2', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', marksObtained: 25, remarks: 'Good score, revise ray diagrams', rank: 1 }
];

export const SEED_HOMEWORK: Homework[] = [
  { id: 'hw1', title: 'Quadratic Equations Exercise 4.2', description: 'Solve all questions from Exercise 4.2 of NCERT textbook and show steps clearly in your notebook.', class: 'Class 10', subject: 'Mathematics', date: '2026-06-25', dueDate: '2026-06-28', teacherId: 't1', teacherName: 'Priyanshu Gupta' },
  { id: 'hw2', title: 'Chemical Reactions Balancing', description: 'Balance the 15 equations provided in the sheet. Upload a clean photograph or PDF of the completed work.', class: 'Class 10', subject: 'Science', date: '2026-06-26', dueDate: '2026-06-29', teacherId: 't1', teacherName: 'Priyanshu Gupta' }
];

export const SEED_HOMEWORK_SUBMISSIONS: HomeworkSubmission[] = [
  { id: 'hs1', homeworkId: 'hw1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', submissionDate: '2026-06-27', textAnswer: 'Completed all 10 questions of Exercise 4.2. Roots calculated correctly.', status: 'SUBMITTED' }
];

export const SEED_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'How to Score 95%+ in Class 10 Board Examinations',
    excerpt: 'Expert strategy tips from Sunshine Classes to conquer your board syllabus with structural revisions, mock tests, and smart planning.',
    content: 'Scoring above 95% in Class 10 board exams is not just about memorizing everything; it is about strategic planning. First, prioritize the NCERT textbook. Every single question in boards originates or aligns with the concepts in NCERT. Second, practice active recall and spaced repetition. Sunshine Classes conducts weekly test series specifically to enforce this. Third, manage your time during the exams. Spend the first 15 minutes reading the question paper meticulously, mapping out which questions to write first. Always start with the sections you are 100% confident in.',
    category: 'Board Preparation',
    author: 'Priyanshu Gupta (Founder)',
    date: '2026-06-20',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'b2',
    title: 'Overcoming Physics Phobia: Concepts Over Formulas',
    excerpt: 'Physics is easy when you relate it to daily life. Here is our teaching methodology to make science your favorite subject.',
    content: 'Many students struggle with physics numericals because they try to mug up formulas without understanding the fundamental physics behind them. At Sunshine Classes, we focus on visualization. When studying refraction, we show live glass slab experiments. Once you visualize light bending as it changes medium, formulas like Snell\'s Law become logical instead of intimidating.',
    category: 'Study Hacks',
    author: 'Priyanshu Gupta (Senior Faculty)',
    date: '2026-06-22',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'b3',
    title: 'The Power of Small Batch Sizes in Coaching',
    excerpt: 'Why crowds of 100+ students in a single class fail to deliver, and why individual attention of small cohorts is the key.',
    content: 'In large classroom halls, students often hesitate to raise their hands and clear doubts. Individual issues are overlooked in favor of general syllabus speed. At Sunshine Classes, we restrict batches to a small size. This allows teachers to understand each student\'s weak areas, analyze their mistakes on weekly tests, and curate custom progress plans.',
    category: 'Education Tips',
    author: 'Neha Sharma (Academic Advisor)',
    date: '2026-06-25',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=60'
  }
];

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 'tstml1',
    name: 'Sanjay Verma (Parent of Rahul Verma)',
    role: 'PARENT',
    content: 'Sunshine Classes completely transformed Rahul\'s attitude towards Mathematics. The personalized weekly feedback report and digital attendance alert help me track his regular progress easily.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  }
];

export const SEED_GALLERY: GalleryItem[] = [
  { id: 'g1', title: 'Saraswati Puja & Board Aspirants blessing ceremony', category: 'EVENTS', imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=60' },
  { id: 'g2', title: 'Interactive Science Practical Demonstration', category: 'CLASSROOM', imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&auto=format&fit=crop&q=60' },
  { id: 'g3', title: 'Annual Sunshine Academic Excellence Awards 2025', category: 'ANNUAL_FUNCTION', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60' },
  { id: 'g4', title: 'Weekly Merit Test Session', category: 'ACTIVITIES', imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=60' },
  { id: 'g5', title: 'Class 10 District Merit Holder Celebration', category: 'RESULTS', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=60' },
  { id: 'g6', title: 'Parent-Teacher Interaction Meet', category: 'EVENTS', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60' }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Admissions Open 2026-27', content: 'Enrollment for Classes 1 to 10 has started. Call office for details.', category: 'ANNOUNCEMENT', targetRole: 'ALL', date: '2026-06-25' },
  { id: 'n2', title: 'Class 10 Board Mock Math Test', content: 'Pre-board diagnostic test on Real Numbers & Algebra this Sunday at 8 AM.', category: 'EXAM', targetRole: 'STUDENT', date: '2026-06-26' },
  { id: 'n3', title: 'Fee Payment Reminder for July', content: 'Due date for July session coaching fee is 10-July-2026. Late charge of 50/- applies post due-date.', category: 'FEE', targetRole: 'STUDENT', date: '2026-06-27' },
  { id: 'n4', title: 'Summer Holiday Notice', content: 'Sunshine Classes will remain closed on 30-June for internal faculty workshop. Regular batches resume from 1-July.', category: 'HOLIDAY', targetRole: 'ALL', date: '2026-06-27' }
];

export const SEED_INQUIRIES: Inquiry[] = [];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', userId: 'u1', username: 'founder', action: 'LOGIN', details: 'Founder logged in from secure terminal', timestamp: '2026-06-27T08:00:00Z' }
];

export const SEED_TIMETABLE: TimetableEntry[] = [
  { id: 'tt1', day: 'Monday', className: 'Class 10', subject: 'Mathematics', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Room 101', startTime: '07:00 AM', endTime: '08:30 AM' },
  { id: 'tt2', day: 'Monday', className: 'Class 10', subject: 'Physics', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Room 101', startTime: '08:30 AM', endTime: '09:30 AM' },
  { id: 'tt5', day: 'Tuesday', className: 'Class 10', subject: 'Mathematics', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Room 101', startTime: '07:00 AM', endTime: '08:30 AM' },
  { id: 'tt8', day: 'Wednesday', className: 'Class 10', subject: 'Physics', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Room 101', startTime: '07:00 AM', endTime: '08:30 AM' },
  { id: 'tt11', day: 'Thursday', className: 'Class 10', subject: 'Mathematics', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Room 101', startTime: '07:00 AM', endTime: '08:30 AM' },
  { id: 'tt13', day: 'Friday', className: 'Class 10', subject: 'Mathematics', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Room 101', startTime: '07:00 AM', endTime: '08:30 AM' },
  { id: 'tt15', day: 'Saturday', className: 'Class 10', subject: 'Revision Test Session', teacherName: 'Priyanshu Gupta (Teacher)', room: 'Main Hall', startTime: '08:00 AM', endTime: '11:00 AM' }
];

export const SEED_TOPPERS: Topper[] = [
  {
    id: 'top-sheet-1',
    name: 'Alaukik Mani Bajpai',
    percentage: '91.60%',
    score: '91.60%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2024',
    year: '2024',
    board: 'CBSE',
    achievementCaption: 'Subjects: Maths, Science, Social Science, Hindi, English',
    desc: 'Subjects: Maths, Science, Social Science, Hindi, English',
    displayOrder: 1,
    isFeatured: true,
    status: 'PUBLISHED'
  },
  {
    id: 'top-sheet-2',
    name: 'Uday Gupta',
    percentage: '90.80%',
    score: '90.80%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2026',
    year: '2026',
    board: 'CBSE',
    achievementCaption: 'Subjects: English, Hindi, Maths Standard, Social Science, Science, Information Technology',
    desc: 'Subjects: English, Hindi, Maths Standard, Social Science, Science, Information Technology',
    displayOrder: 2,
    isFeatured: true,
    status: 'PUBLISHED'
  },
  {
    id: 'top-sheet-rajeev',
    name: 'Rajeev Kumar Verma',
    percentage: '90.20%',
    score: '90.20%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2022',
    year: '2022',
    board: 'CBSE',
    achievementCaption: 'Subjects: Social Science, Science, Maths, Hindi, English',
    desc: 'Subjects: Social Science, Science, Maths, Hindi, English',
    displayOrder: 3,
    isFeatured: true,
    status: 'PUBLISHED'
  },
  {
    id: 'top-sheet-3',
    name: 'Ayushi Raj',
    percentage: '87.00%',
    score: '87.00%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2025',
    year: '2025',
    board: 'CBSE',
    achievementCaption: 'Outstanding Performance in Board Examinations',
    desc: 'Outstanding Performance in Board Examinations',
    displayOrder: 4,
    isFeatured: true,
    status: 'PUBLISHED'
  },
  {
    id: 'top-sheet-4',
    name: 'Zaina Siddiqui',
    percentage: '86.80%',
    score: '86.80%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2025',
    year: '2025',
    board: 'CBSE',
    achievementCaption: 'Subjects: Hindi, English, Maths, Science, Social Science',
    desc: 'Subjects: Hindi, English, Maths, Science, Social Science',
    displayOrder: 5,
    isFeatured: true,
    status: 'PUBLISHED'
  },
  {
    id: 'top-sheet-5',
    name: 'Harshita Mishra',
    percentage: '86.00%',
    score: '86.00%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2026',
    year: '2026',
    board: 'CBSE',
    achievementCaption: 'Subjects: Information Technology, Science, Mathematics',
    desc: 'Subjects: Information Technology, Science, Mathematics',
    displayOrder: 6,
    isFeatured: true,
    status: 'PUBLISHED'
  },
  {
    id: 'top-sheet-6',
    name: 'Kaushlendra Raj',
    percentage: '81.80%',
    score: '81.80%',
    studentClass: 'Class 10',
    class: 'Class 10',
    academicYear: '2025',
    year: '2025',
    board: 'CBSE',
    achievementCaption: 'Academic Merit Distinction Score',
    desc: 'Academic Merit Distinction Score',
    displayOrder: 7,
    isFeatured: true,
    status: 'PUBLISHED'
  }
];

export const SEED_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat1',
    materialId: 'mat1',
    title: 'Class 10 Math Formula Cheat-Sheet',
    slug: 'class-10-math-formula-cheat-sheet',
    description: 'Complete algebraic, quadratic, and trigonometric formulas in 2 clean pages for quick revision before pre-board exams.',
    desc: 'Complete algebraic, quadratic, and trigonometric formulas in 2 clean pages.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Chapter 1 & 2',
    materialType: 'FORMULA_SHEET',
    category: 'NOTES',
    file: 'math_formulas.pdf',
    size: '1.2 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 342,
    viewCount: 1250,
    tags: ['Math', 'Formulas', 'Class 10', 'Board Exam', 'Algebra', 'Trigonometry'],
    seoTitle: 'Class 10 Math Formula Cheat Sheet PDF - Sunshine Classes',
    metaDescription: 'Free download Class 10 Mathematics formula sheet covering Algebra, Trigonometry, and Quadratic equations by Priyanshu Gupta Sir.',
    keywords: ['Class 10 Math', 'Formula Sheet', 'Board Revision', 'NCERT Maths'],
    createdBy: 'Priyanshu Gupta (Founder)',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-15T12:00:00Z',
    date: '2026-06-01'
  },
  {
    id: 'mat2',
    materialId: 'mat2',
    title: 'Chemical Reactions and Equations PDF',
    slug: 'chemical-reactions-and-equations-pdf',
    description: 'NCERT back exercise solved chemical reactions with balancing shortcuts, oxidation-reduction notes, and board questions.',
    desc: 'NCERT back exercise solved chemical reactions with balancing shortcuts.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'Chapter 1',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'chemical_equations.pdf',
    size: '2.5 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 289,
    viewCount: 980,
    tags: ['Science', 'Chemistry', 'Chemical Reactions', 'Class 10', 'NCERT'],
    seoTitle: 'Class 10 Science Chapter 1 Notes PDF - Sunshine Classes',
    metaDescription: 'Download NCERT Class 10 Science Chemical Reactions and Equations solved notes with balancing equations practice sheet.',
    keywords: ['Class 10 Chemistry', 'Chemical Reactions Notes', 'NCERT Solutions'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-05T11:00:00Z',
    updatedAt: '2026-06-18T14:30:00Z',
    date: '2026-06-05'
  },
  {
    id: 'mat3',
    materialId: 'mat3',
    title: 'Active & Passive Voice Rules Guide',
    slug: 'active-and-passive-voice-rules-guide',
    description: 'English grammar rules with pre-board mock practice questions and 50 solved transformation examples.',
    desc: 'English grammar rules with pre-board mock practice questions.',
    class: 'Class 8',
    subject: 'English',
    chapter: 'Grammar Unit 3',
    materialType: 'WORKSHEET',
    category: 'QUESTION_PAPER',
    file: 'english_grammar_voice.pdf',
    size: '800 KB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 175,
    viewCount: 620,
    tags: ['English', 'Grammar', 'Active Passive', 'Class 8', 'Worksheet'],
    seoTitle: 'Class 8 English Active Passive Voice Rules PDF - Sunshine Classes',
    metaDescription: 'Complete guide for Active and Passive Voice for Class 8 English Grammar with solved worksheets.',
    keywords: ['Class 8 English', 'Active Passive Voice', 'Grammar Rules'],
    createdBy: 'Ritu Singh (Teacher)',
    uploadedBy: 'Ritu Singh (Teacher)',
    createdAt: '2026-06-10T09:30:00Z',
    updatedAt: '2026-06-20T16:00:00Z',
    date: '2026-06-10'
  },
  {
    id: 'mat4',
    materialId: 'mat4',
    title: 'Class 10 Physics Ray Diagrams',
    slug: 'class-10-physics-ray-diagrams',
    description: 'Hand-drawn mirror and lens ray formation scenarios for board exam reference with sign convention rules.',
    desc: 'Hand-drawn mirror and lens ray formation scenarios for board exam reference.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'Chapter 10',
    materialType: 'DIAGRAM_SHEET' as any,
    category: 'NOTES',
    file: 'physics_ray_diagrams.pdf',
    size: '4.1 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 412,
    viewCount: 1420,
    tags: ['Physics', 'Ray Diagrams', 'Light', 'Class 10', 'Mirrors', 'Lenses'],
    seoTitle: 'Class 10 Physics Ray Diagrams Sheet PDF - Sunshine Classes',
    metaDescription: 'Download high quality ray diagrams for Class 10 Physics Light Reflection and Refraction chapter.',
    keywords: ['Class 10 Physics', 'Ray Diagrams', 'Light Chapter', 'Board Physics'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-12T14:00:00Z',
    updatedAt: '2026-06-22T10:00:00Z',
    date: '2026-06-12'
  },
  {
    id: 'mat5',
    materialId: 'mat5',
    title: 'Class 10 Maths Chapter 3 Important Questions',
    slug: 'class-10-maths-chapter-3-important-questions',
    description: 'Top 25 high-frequency board examination questions from Pair of Linear Equations in Two Variables with step-by-step solutions.',
    desc: 'Top 25 high-frequency board examination questions from Chapter 3 Pair of Linear Equations.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Chapter 3',
    materialType: 'QUESTION_BANK',
    category: 'QUESTION_PAPER',
    file: 'maths_ch3_important_questions.pdf',
    size: '1.8 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 520,
    viewCount: 1890,
    tags: ['Mathematics', 'Class 10', 'Chapter 3', 'Linear Equations', 'Important Questions'],
    seoTitle: 'Class 10 Maths Chapter 3 Important Questions PDF - Sunshine Classes',
    metaDescription: 'Free PDF download of Class 10 Maths Chapter 3 Linear Equations Important Questions solved by experts.',
    keywords: ['Class 10 Maths', 'Chapter 3 Important Questions', 'Linear Equations in Two Variables'],
    createdBy: 'Priyanshu Gupta (Founder)',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-15T08:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
    date: '2026-06-15'
  },
  {
    id: 'mat6',
    materialId: 'mat6',
    title: 'Class 10 Science Pre-Board Sample Paper 2026',
    slug: 'class-10-science-pre-board-sample-paper-2026',
    description: 'Complete 80-marks CBSE pattern sample paper for Class 10 Science with detailed answer marking scheme and solutions.',
    desc: 'Complete 80-marks CBSE pattern sample paper for Class 10 Science.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'All Chapters',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'science_sample_paper_2026.pdf',
    size: '3.2 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 610,
    viewCount: 2100,
    tags: ['Science', 'Sample Paper', 'Class 10', 'CBSE 2026', 'Pre-Board'],
    seoTitle: 'Class 10 Science Sample Paper 2026 with Solutions - Sunshine Classes',
    metaDescription: 'Download 2026 Class 10 Science board sample paper with answer key and marking scheme.',
    keywords: ['Class 10 Science Sample Paper', 'CBSE Class 10 Sample Paper', 'Pre Board Exam 2026'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-18T15:00:00Z',
    updatedAt: '2026-06-26T09:00:00Z',
    date: '2026-06-18'
  },
  {
    id: 'mat7',
    materialId: 'mat7',
    title: 'Class 9 Physics Motion & Numerical Practice Workbook',
    slug: 'class-9-physics-motion-numerical-workbook',
    description: '30 solved velocity-time graph problems, acceleration formulas, and uniform circular motion numerical sheets for Class 9 Science.',
    desc: '30 solved velocity-time graph problems and numerical sheets for Class 9 Science.',
    class: 'Class 9',
    subject: 'Science',
    chapter: 'Chapter 8',
    materialType: 'WORKSHEET',
    category: 'NOTES',
    file: 'class9_physics_motion.pdf',
    size: '2.1 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 380,
    viewCount: 1120,
    tags: ['Physics', 'Class 9', 'Motion', 'Numericals', 'Graphs'],
    seoTitle: 'Class 9 Physics Motion Numerical Practice Workbook - Sunshine Classes',
    metaDescription: 'Free PDF download of Class 9 Physics Motion chapter numerical worksheet with solved examples.',
    keywords: ['Class 9 Physics', 'Motion Chapter', 'Numerical Practice', 'Graphs'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-06-27T10:00:00Z',
    date: '2026-06-20'
  },
  {
    id: 'mat8',
    materialId: 'mat8',
    title: 'Class 10 Biology Life Processes & Human Heart Diagram Sheet',
    slug: 'class-10-biology-life-processes-diagram-sheet',
    description: 'High-resolution labeled biological diagrams for double circulation, nephron structure, and digestive system for Class 10 Board exam.',
    desc: 'High-resolution labeled biological diagrams for human heart and nephron structure.',
    class: 'Class 10',
    subject: 'Biology',
    chapter: 'Chapter 6',
    materialType: 'DIAGRAM_SHEET' as any,
    category: 'NOTES',
    file: 'biology_life_processes_diagrams.pdf',
    size: '3.8 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 780,
    viewCount: 2450,
    tags: ['Biology', 'Class 10', 'Life Processes', 'Diagrams', 'Board Exam'],
    seoTitle: 'Class 10 Biology Life Processes Labeled Diagrams PDF - Sunshine Classes',
    metaDescription: 'Download Class 10 Biology Life Processes human heart and nephron diagrams sheet by Rajeev Sir.',
    keywords: ['Class 10 Biology', 'Life Processes Diagrams', 'Human Heart Diagram', 'Board Biology'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-22T09:00:00Z',
    updatedAt: '2026-06-28T14:00:00Z',
    date: '2026-06-22'
  },
  {
    id: 'mat9',
    materialId: 'mat9',
    title: 'Class 8 Mathematics Algebraic Identities & Mensuration Worksheet',
    slug: 'class-8-math-algebraic-identities-mensuration',
    description: 'Chapterwise practice worksheet covering binomial expansion, surface area, and volume formulas for Class 8 students.',
    desc: 'Chapterwise practice worksheet covering binomial expansion and mensuration.',
    class: 'Class 8',
    subject: 'Mathematics',
    chapter: 'Chapter 9 & 11',
    materialType: 'WORKSHEET',
    category: 'NOTES',
    file: 'class8_math_algebra_mensuration.pdf',
    size: '1.4 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 210,
    viewCount: 740,
    tags: ['Mathematics', 'Class 8', 'Algebra', 'Mensuration', 'Worksheet'],
    seoTitle: 'Class 8 Maths Algebraic Identities & Mensuration PDF - Sunshine Classes',
    metaDescription: 'Download Class 8 Maths practice worksheet on Algebraic Expressions and Mensuration.',
    keywords: ['Class 8 Maths', 'Algebraic Identities', 'Mensuration Formulas'],
    createdBy: 'Priyanshu Gupta (Founder)',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-24T08:30:00Z',
    updatedAt: '2026-06-29T10:00:00Z',
    date: '2026-06-24'
  },
  {
    id: 'mat10',
    materialId: 'mat10',
    title: 'Class 10 Chemistry Acids, Bases & Salts Secret Master Mindmap 🔒',
    slug: 'class-10-chemistry-acids-bases-salts-master-mindmap',
    description: 'Exclusive enrolled-student revision sheet summarizing pH scale values, indicators, and chlor-alkali process chemical equations.',
    desc: 'Exclusive enrolled-student revision sheet summarizing pH scale values and chemical equations.',
    class: 'Class 10',
    subject: 'Chemistry',
    chapter: 'Chapter 2',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'chemistry_acids_bases_salts_mindmap.pdf',
    size: '2.9 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: false,
    status: 'PUBLISHED',
    downloadCount: 450,
    viewCount: 1320,
    tags: ['Chemistry', 'Class 10', 'Acids Bases Salts', 'Mindmap', 'Student Only'],
    seoTitle: 'Class 10 Chemistry Acids Bases & Salts Mindmap - Sunshine Classes',
    metaDescription: 'Enrolled student restricted study material for Class 10 Chemistry Acids Bases and Salts.',
    keywords: ['Class 10 Chemistry', 'Acids Bases Salts', 'Mindmap', 'Enrolled Students'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-25T12:00:00Z',
    updatedAt: '2026-06-30T11:00:00Z',
    date: '2026-06-25'
  },
  {
    id: 'mat11',
    materialId: 'mat11',
    title: 'Class 10 Social Studies History: Rise of Nationalism in Europe Summary',
    slug: 'class-10-sst-rise-of-nationalism-in-europe-summary',
    description: 'Timeline of events from 1789 French Revolution, Unification of Italy and Germany, and 5-mark board long question answers.',
    desc: 'Timeline of events from French Revolution to Unification of Italy & Germany.',
    class: 'Class 10',
    subject: 'Social Studies',
    chapter: 'History Chapter 1',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'class10_history_nationalism_europe.pdf',
    size: '1.9 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 310,
    viewCount: 890,
    tags: ['Social Studies', 'History', 'Class 10', 'Nationalism', 'NCERT'],
    seoTitle: 'Class 10 History Chapter 1 Rise of Nationalism Notes PDF - Sunshine Classes',
    metaDescription: 'Complete revision notes and long answer guide for Class 10 History Chapter 1 Rise of Nationalism in Europe.',
    keywords: ['Class 10 History', 'Rise of Nationalism in Europe', 'SST Board Notes'],
    createdBy: 'Ritu Singh (Teacher)',
    uploadedBy: 'Ritu Singh (Teacher)',
    createdAt: '2026-06-26T10:00:00Z',
    updatedAt: '2026-07-01T15:00:00Z',
    date: '2026-06-26'
  },
  {
    id: 'mat12',
    materialId: 'mat12',
    title: 'Class 7 Science Nutrition in Plants & Animals NCERT Notes',
    slug: 'class-7-science-nutrition-in-plants-animals',
    description: 'Photosynthesis process, stomata diagrams, modes of nutrition, and digestive tract steps explained simply for Class 7 students.',
    desc: 'Photosynthesis process, stomata diagrams, and digestive tract steps explained simply.',
    class: 'Class 7',
    subject: 'Science',
    chapter: 'Chapter 1 & 2',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'class7_science_nutrition.pdf',
    size: '1.1 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 160,
    viewCount: 540,
    tags: ['Science', 'Class 7', 'Nutrition', 'NCERT Notes'],
    seoTitle: 'Class 7 Science Nutrition in Plants Notes PDF - Sunshine Classes',
    metaDescription: 'Free download Class 7 Science Chapter 1 and 2 notes with diagrams.',
    keywords: ['Class 7 Science', 'Nutrition in Plants', 'NCERT Class 7'],
    createdBy: 'Rajeev Kr. Verma (Co-Founder)',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-27T09:00:00Z',
    updatedAt: '2026-07-02T11:00:00Z',
    date: '2026-06-27'
  }
];

export const SEED_FOUNDERS: FounderMember[] = [
  {
    id: 'fm-priyanshu',
    name: 'Priyanshu Gupta',
    title: 'Founder & Academic Director',
    qualification: 'B.Sc. (Mathematics)',
    message: 'Sunshine Classes was founded with a vision of making quality education accessible through conceptual learning, disciplined practice, and individual attention. Priyanshu Gupta leads the institute\'s academic direction, mentors students across all subjects, and personally oversees curriculum planning, revision programs, classroom standards, and board examination preparation. His strongest expertise lies in Mathematics and Science, and his focus is to help every student build confidence, analytical thinking, and long-term academic success.',
    tuitionFocus: 'Mathematics & Science',
    avatarInitials: 'PG',
    isPrimary: true,
    displayOrder: 1,
    status: 'PUBLISHED',
    socials: {
      instagram: 'https://www.instagram.com/sunshineclassespihani/'
    }
  },
  {
    id: 'fm-rajeev',
    name: 'Rajeev Kr. Verma',
    title: 'Co-Founder & Operations Lead',
    qualification: 'B.Tech CSE',
    message: 'Rajeev Kr. Verma manages the operational, technological, and digital growth initiatives of Sunshine Classes. He leads the development of the institute\'s website, ERP platform, admissions systems, and digital infrastructure while coordinating administrative processes, branding, strategic collaborations, and organizational development. His role is to build efficient systems that enhance the experience for students, parents, and staff while supporting the institute\'s long-term growth.',
    tuitionFocus: '',
    avatarInitials: 'RV',
    isPrimary: false,
    displayOrder: 2,
    status: 'PUBLISHED',
    socials: {
      linkedin: 'https://www.linkedin.com/in/rajeev-kumar-verma-2110a21b7/',
      instagram: 'https://www.instagram.com/sarcastic._.rk/'
    }
  }
];

export const SEED_INSTITUTE_STRENGTHS: InstituteStrength[] = [
  {
    id: 'str-1',
    title: 'Experienced Teachers',
    description: 'Subject specialists with 10+ years of dedicated teaching expertise focused on concept clarity and student success.',
    iconName: 'GraduationCap',
    badge: 'Expert Faculty',
    displayOrder: 1
  },
  {
    id: 'str-2',
    title: 'NCERT-Based Curriculum',
    description: 'Strictly aligned with NCERT guidelines and board exam patterns for bulletproof preparation.',
    iconName: 'BookOpen',
    badge: '100% Board Aligned',
    displayOrder: 2
  },
  {
    id: 'str-3',
    title: 'Weekly Assessments',
    description: 'Chapter-wise test series and mock exams with detailed answer key reviews and score tracking.',
    iconName: 'ClipboardCheck',
    badge: 'Continuous Testing',
    displayOrder: 3
  },
  {
    id: 'str-4',
    title: 'Doubt Solving Sessions',
    description: 'Dedicated daily doubt clinics to ensure zero backlog and instant resolution for tricky questions.',
    iconName: 'HelpCircle',
    badge: '1-on-1 Guidance',
    displayOrder: 4
  },
  {
    id: 'str-5',
    title: 'Parent Progress Updates',
    description: 'Transparent monthly performance reports, digital attendance logs, and regular parent-teacher meetups.',
    iconName: 'TrendingUp',
    badge: 'Real-Time Reports',
    displayOrder: 5
  },
  {
    id: 'str-6',
    title: 'Personalized Attention',
    description: 'Small batch sizes (max 25 students) allowing personal mentorship for every learner.',
    iconName: 'UserCheck',
    badge: 'Small Batches',
    displayOrder: 6
  },
  {
    id: 'str-7',
    title: 'Affordable Fees',
    description: 'High-quality coaching made accessible with reasonable, transparent monthly fee structures.',
    iconName: 'Wallet',
    badge: 'Value Education',
    displayOrder: 7
  }
];

export const interpolateTemplate = (templateStr: string, variables: Record<string, any>): string => {
  let result = templateStr;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
  }
  return result;
};

export const SEED_BATCH_BULLETINS: BatchBulletinPost[] = [
  {
    id: 'bb1',
    batchId: 'b1',
    batchName: 'Class 10 - Morning Excellence',
    authorId: 'u2',
    authorName: 'Priyanshu Gupta',
    authorRole: 'TEACHER',
    content: 'Good morning everyone! Please make sure to complete the trigonometry assignment before coming to class tomorrow.',
    timestamp: '2026-07-05T08:30:00Z'
  },
  {
    id: 'bb2',
    batchId: 'b2',
    batchName: 'Class 10 - Evening Stars',
    authorId: 'u2',
    authorName: 'Priyanshu Gupta',
    authorRole: 'TEACHER',
    content: 'Excellent work in yesterday’s mock quiz! Today we will begin our discussions on Electricity numericals. Keep your physics notebooks ready.',
    timestamp: '2026-07-06T15:00:00Z'
  },
  {
    id: 'bb3',
    batchId: 'b2',
    batchName: 'Class 10 - Evening Stars',
    authorId: 'u4',
    authorName: 'Rahul Verma',
    authorRole: 'STUDENT',
    content: 'Priyanshu Sir, will we be covering the circuit diagram problems today or in the next class? I had some doubts on parallel resistors.',
    timestamp: '2026-07-06T15:25:00Z'
  }
];




