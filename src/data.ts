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
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    assignedTeachers: ['Neha Sharma', 'Ritu Singh'],
    timings: [
      { id: 'ct-6-1', label: 'Morning', timeRange: '07:00 AM – 09:00 AM', teachers: ['Neha Sharma'], capacity: 5000, enrolledCount: 10, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-6-2', label: 'Afternoon', timeRange: '02:00 PM – 04:00 PM', teachers: ['Ritu Singh'], capacity: 5000, enrolledCount: 12, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-7',
    name: 'Class 7',
    code: 'C07',
    defaultMonthlyFee: 700,
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    assignedTeachers: ['Ritu Singh'],
    timings: [
      { id: 'ct-7-1', label: 'Morning', timeRange: '07:00 AM – 09:00 AM', teachers: ['Ritu Singh'], capacity: 5000, enrolledCount: 14, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-7-2', label: 'Evening', timeRange: '04:00 PM – 06:00 PM', teachers: ['Ritu Singh'], capacity: 5000, enrolledCount: 11, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-8',
    name: 'Class 8',
    code: 'C08',
    defaultMonthlyFee: 700,
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    assignedTeachers: ['Ritu Singh'],
    timings: [
      { id: 'ct-8-1', label: 'Afternoon', timeRange: '02:00 PM – 04:00 PM', teachers: ['Ritu Singh'], capacity: 5000, enrolledCount: 22, status: 'ACTIVE', section: 'Section A' }
    ]
  },
  {
    id: 'cls-9',
    name: 'Class 9',
    code: 'C09',
    defaultMonthlyFee: 1000,
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Anil Pandey'],
    timings: [
      { id: 'ct-9-1', label: 'Evening', timeRange: '03:00 PM – 05:00 PM', teachers: ['Anil Pandey'], capacity: 5000, enrolledCount: 28, status: 'ACTIVE', section: 'Section A' }
    ]
  },
  {
    id: 'cls-10',
    name: 'Class 10',
    code: 'C10',
    defaultMonthlyFee: 1200,
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Priyanshu Gupta'],
    timings: [
      { id: 'ct-10-1', label: 'Morning', timeRange: '07:00 AM – 09:30 AM', teachers: ['Priyanshu Gupta'], capacity: 5000, enrolledCount: 25, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-10-2', label: 'Evening', timeRange: '04:00 PM – 06:30 PM', teachers: ['Priyanshu Gupta'], capacity: 5000, enrolledCount: 32, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-11',
    name: 'Class 11',
    code: 'C11',
    defaultMonthlyFee: 1500,
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    stream: 'Science',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Anil Pandey', 'Priyanshu Gupta'],
    timings: [
      { id: 'ct-11-1', label: 'Morning', timeRange: '07:30 AM – 10:00 AM', teachers: ['Priyanshu Gupta'], capacity: 5000, enrolledCount: 18, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-11-2', label: 'Evening', timeRange: '05:00 PM – 07:30 PM', teachers: ['Anil Pandey'], capacity: 5000, enrolledCount: 15, status: 'ACTIVE', section: 'Section B' }
    ]
  },
  {
    id: 'cls-12',
    name: 'Class 12',
    code: 'C12',
    defaultMonthlyFee: 1500,
    capacity: 10000,
    totalCapacity: 10000,
    status: 'ACTIVE',
    academicSession: '2026-2027',
    stream: 'Science',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    assignedTeachers: ['Anil Pandey', 'Priyanshu Gupta'],
    timings: [
      { id: 'ct-12-1', label: 'Morning', timeRange: '07:30 AM – 10:00 AM', teachers: ['Anil Pandey'], capacity: 5000, enrolledCount: 20, status: 'ACTIVE', section: 'Section A' },
      { id: 'ct-12-2', label: 'Evening', timeRange: '05:00 PM – 07:30 PM', teachers: ['Priyanshu Gupta'], capacity: 5000, enrolledCount: 22, status: 'ACTIVE', section: 'Section B' }
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
    <p style="margin: 2px 0 0 0;">WhatsApp: +91 8707738284 | Call: +91 9161586254</p>
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
    <p style="margin: 2px 0 0 0;">WhatsApp: +91 8707738284 | Call: +91 9161586254</p>
  </div>
</div>`
};

export const SEED_TEACHERS: Teacher[] = [
  {
    id: 't1',
    userId: 'u-teacher-1',
    name: 'Priyanshu Gupta (Teacher)',
    email: 'priyanshu.teacher@sunshineclasses.net',
    phone: '9999900004',
    qualification: 'M.Sc. Mathematics, B.Ed',
    specialty: ['Mathematics', 'Physics'],
    batches: ['Class 10 - Morning Excellence', 'Class 9 - Foundations']
  },
  {
    id: 't2',
    userId: 'u-teacher-2',
    name: 'Amit Sharma',
    email: 'amit.teacher@sunshineclasses.net',
    phone: '9999900012',
    qualification: 'M.Sc. Chemistry, B.Ed',
    specialty: ['Science', 'Chemistry'],
    batches: ['Class 10 - Morning Excellence', 'Class 8 - Star Batch']
  },
  {
    id: 't3',
    userId: 'u-teacher-3',
    name: 'Neha Singh',
    email: 'neha.teacher@sunshineclasses.net',
    phone: '9999900013',
    qualification: 'M.A. English Literature, B.Ed',
    specialty: ['English', 'Social Science'],
    batches: ['Class 9 - Foundations', 'Class 8 - Star Batch']
  }
];

export const SEED_STUDENTS: Student[] = [
  {
    id: "s1",
    userId: "u-student-1",
    rollNo: "SC-1001",
    name: "Rahul Verma",
    class: "Class 10",
    fatherName: "Ram Pal Verma",
    motherName: "Shanti Devi",
    dob: "2011-05-15",
    gender: "Male",
    address: "123 Education Lane, Pihani, Hardoi, UP",
    mobile: "9999900005",
    whatsapp: "9999900005",
    parentMobile: "9999900006",
    email: "rahul.verma@sunshineclasses.net",
    preferredBatch: "Class 10 - Morning Excellence",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2025-04-10",
    attendancePercentage: 94,
    status: "ACTIVE"
  },
  {
    id: "s2",
    userId: "u-student-2",
    rollNo: "SC-1002",
    name: "Ananya Sharma",
    class: "Class 9",
    fatherName: "Sanjay Sharma",
    motherName: "Pooja Sharma",
    dob: "2012-08-20",
    gender: "Female",
    address: "45 Station Road, Pihani, Hardoi, UP",
    mobile: "9999900021",
    whatsapp: "9999900021",
    parentMobile: "9999900022",
    email: "ananya.sharma@sunshineclasses.net",
    preferredBatch: "Class 9 - Foundations",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2025-05-02",
    attendancePercentage: 96,
    status: "ACTIVE"
  },
  {
    id: "s3",
    userId: "u-student-3",
    rollNo: "SC-1003",
    name: "Aryan Patel",
    class: "Class 8",
    fatherName: "Virendra Patel",
    motherName: "Sunita Patel",
    dob: "2013-11-10",
    gender: "Male",
    address: "88 Market Chowk, Pihani, Hardoi, UP",
    mobile: "9999900031",
    whatsapp: "9999900031",
    parentMobile: "9999900032",
    email: "aryan.patel@sunshineclasses.net",
    preferredBatch: "Class 8 - Star Batch",
    preferredTiming: "04:00 PM - 06:00 PM",
    admissionDate: "2025-06-15",
    attendancePercentage: 91,
    status: "ACTIVE"
  },
  {
    id: "s1004",
    userId: "u-student-1004",
    rollNo: "SC-1004",
    name: "Dev Srivastava",
    class: "Class 9",
    fatherName: "Mr. Shiv Prakash Srivastava",
    motherName: "Mrs. Mohini Devi",
    dob: "8/22/2012",
    gender: "Male",
    address: "Village and post majhiya Thana Pihani district Hardoi",
    mobile: "9198028357",
    whatsapp: "9198028357",
    parentMobile: "9198028357",
    email: "dev.srivastava@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 88,
    status: "ACTIVE"
  },
  {
    id: "s1005",
    userId: "u-student-1005",
    rollNo: "SC-1005",
    name: "Zuha Khan",
    class: "Class 10",
    fatherName: "Mr. Iftkhar Khan",
    motherName: "Mrs. Nagma Khan",
    dob: "8/2/2012",
    gender: "Female",
    address: "Behind Uttar Pradesh bank",
    mobile: "9555719123",
    whatsapp: "9555719123",
    parentMobile: "9452138851",
    email: "zuha.khan@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 88,
    status: "ACTIVE"
  },
  {
    id: "s1006",
    userId: "u-student-1006",
    rollNo: "SC-1006",
    name: "Arbab Khan",
    class: "Class 6",
    fatherName: "Mr. Iftkhar Khan",
    motherName: "Mrs. Nagma Khan",
    dob: "6/27/2015",
    gender: "Male",
    address: "Behind Uttar Pradesh bank",
    mobile: "9452138851",
    whatsapp: "9452138851",
    parentMobile: "9452138851",
    email: "arbab.khan@sunshineclasses.net",
    preferredBatch: "Class 6 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 97,
    status: "ACTIVE"
  },
  {
    id: "s1007",
    userId: "u-student-1007",
    rollNo: "SC-1007",
    name: "Aayza siddiqui",
    class: "Class 7",
    fatherName: "Uzair siddiqui",
    motherName: "Shahida anjum",
    dob: "6/26/2014",
    gender: "Female",
    address: "Mohalla Mishrana,near tejas interprises, Pihani",
    mobile: "8299426234",
    whatsapp: "8299426234",
    parentMobile: "9450338670",
    email: "aayza.siddiqui@sunshineclasses.net",
    preferredBatch: "Class 7 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 97,
    status: "ACTIVE"
  },
  {
    id: "s1008",
    userId: "u-student-1008",
    rollNo: "SC-1008",
    name: "Sachi kapoor",
    class: "Class 8",
    fatherName: "Mr. kuldeep kapoor",
    motherName: "Mrs. Mitali kapoor",
    dob: "3/17/2013",
    gender: "Female",
    address: "Mureed khani pihani",
    mobile: "9140138090",
    whatsapp: "9140138090",
    parentMobile: "9794991952",
    email: "sachi.kapoor@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1009",
    userId: "u-student-1009",
    rollNo: "SC-1009",
    name: "Naimish Mishra",
    class: "Class 9",
    fatherName: "Mr. Pawan Mishra",
    motherName: "Mrs. Suman Mishra",
    dob: "9/21/2011",
    gender: "Male",
    address: "Mohalla Mishrana pihani",
    mobile: "8175848341",
    whatsapp: "8175848341",
    parentMobile: "8381939160",
    email: "naimish.mishra@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 91,
    status: "ACTIVE"
  },
  {
    id: "s1010",
    userId: "u-student-1010",
    rollNo: "SC-1010",
    name: "Avinoor singh johal",
    class: "Class 9",
    fatherName: "Amardeep Singh johal",
    motherName: "Satinder kaur",
    dob: "9/1/2011",
    gender: "Male",
    address: "Johal farm Karim nagar pihani",
    mobile: "7398227013",
    whatsapp: "7398227013",
    parentMobile: "9919375310",
    email: "avinoor.singh.johal@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 93,
    status: "ACTIVE"
  },
  {
    id: "s1011",
    userId: "u-student-1011",
    rollNo: "SC-1011",
    name: "Lakshya pratap singh",
    class: "Class 9",
    fatherName: "Yogesh singh",
    motherName: "Renu singh",
    dob: "6/10/2010",
    gender: "Male",
    address: "Jahani Kheda Road Near Dak Bungalow",
    mobile: "9235239015",
    whatsapp: "9235239015",
    parentMobile: "9918724483",
    email: "lakshya.pratap.singh@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1012",
    userId: "u-student-1012",
    rollNo: "SC-1012",
    name: "Divya Singh",
    class: "Class 10",
    fatherName: "Anup Kumar Singh",
    motherName: "Sushmita Singh",
    dob: "3/6/2012",
    gender: "Female",
    address: "Majhiya ,near S.S.S Inter College",
    mobile: "8318484860",
    whatsapp: "8318484860",
    parentMobile: "7807823755",
    email: "divya.singh@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 98,
    status: "ACTIVE"
  },
  {
    id: "s1013",
    userId: "u-student-1013",
    rollNo: "SC-1013",
    name: "Aditya Nagpal",
    class: "Class 8",
    fatherName: "Mr.Pravesh Nagpal",
    motherName: "Mrs.Kavita Nagpal",
    dob: "2/1/2013",
    gender: "Male",
    address: "Nagpal Fashion Wear Katra Bazar Pihani",
    mobile: "6386475589",
    whatsapp: "6386475589",
    parentMobile: "9839782544",
    email: "aditya.nagpal@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 95,
    status: "ACTIVE"
  },
  {
    id: "s1014",
    userId: "u-student-1014",
    rollNo: "SC-1014",
    name: "Shaurya pal",
    class: "Class 8",
    fatherName: "Guardian",
    motherName: "Mother",
    dob: "7/17/2014",
    gender: "Male",
    address: "Nizampur katra Bazar pihani",
    mobile: "8957418197",
    whatsapp: "8957418197",
    parentMobile: "8957418197",
    email: "shaurya.pal@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 91,
    status: "ACTIVE"
  },
  {
    id: "s1015",
    userId: "u-student-1015",
    rollNo: "SC-1015",
    name: "Vibhu mishra",
    class: "Class 5",
    fatherName: "Amit mishra",
    motherName: "Ratna mishra",
    dob: "9/4/2015",
    gender: "Male",
    address: "MO.mureed khani pihani (hardoi)",
    mobile: "9305511813",
    whatsapp: "9305511813",
    parentMobile: "933609200",
    email: "vibhu.mishra@sunshineclasses.net",
    preferredBatch: "Class 5 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 93,
    status: "ACTIVE"
  },
  {
    id: "s1016",
    userId: "u-student-1016",
    rollNo: "SC-1016",
    name: "Aishman Kaur",
    class: "Class 10",
    fatherName: "Mr Jagdeep Singh",
    motherName: "Mrs Kamaljeet Kaur",
    dob: "10/6/2010",
    gender: "Female",
    address: "Johal Farm",
    mobile: "9838382073",
    whatsapp: "9838382073",
    parentMobile: "9838382073",
    email: "aishman.kaur@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 95,
    status: "ACTIVE"
  },
  {
    id: "s1017",
    userId: "u-student-1017",
    rollNo: "SC-1017",
    name: "Love Sirat Kaur",
    class: "Class 7",
    fatherName: "Mr Jagdeep Singh",
    motherName: "Mrs Kamaljeet Kaur",
    dob: "9/1/2014",
    gender: "Female",
    address: "JOHAL FARM",
    mobile: "9838382073",
    whatsapp: "9838382073",
    parentMobile: "9838382073",
    email: "love.sirat.kaur@sunshineclasses.net",
    preferredBatch: "Class 7 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 96,
    status: "ACTIVE"
  },
  {
    id: "s1018",
    userId: "u-student-1018",
    rollNo: "SC-1018",
    name: "Abhay singh",
    class: "Class 9",
    fatherName: "Mahendra pal verma",
    motherName: "Meena devi",
    dob: "8/11/2012",
    gender: "Male",
    address: "Ambedkar Nagar pihani",
    mobile: "8887866720",
    whatsapp: "8887866720",
    parentMobile: "7355787614",
    email: "abhay.singh@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1019",
    userId: "u-student-1019",
    rollNo: "SC-1019",
    name: "Danish siddiqui",
    class: "Class 10",
    fatherName: "Israra Ali",
    motherName: "Fahmida",
    dob: "12/17/2011",
    gender: "Male",
    address: "Moh. Mureed khani",
    mobile: "6306681593",
    whatsapp: "6306681593",
    parentMobile: "8299778749",
    email: "danish.siddiqui@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 97,
    status: "ACTIVE"
  },
  {
    id: "s1020",
    userId: "u-student-1020",
    rollNo: "SC-1020",
    name: "Supriya Verma",
    class: "Class 10",
    fatherName: "Sanjay Kumar Verma",
    motherName: "Sudha Devi",
    dob: "11/23/2009",
    gender: "Female",
    address: "Mohalla Ambedkar Nagar opposite power house",
    mobile: "7524850567",
    whatsapp: "7524850567",
    parentMobile: "9621970541",
    email: "supriya.verma@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1021",
    userId: "u-student-1021",
    rollNo: "SC-1021",
    name: "Aradhy Gupta",
    class: "Class 8",
    fatherName: "Mr. Ashish Gupta",
    motherName: "Ms. Neha Gupta",
    dob: "2/5/2013",
    gender: "Male",
    address: "Moh. Misharana",
    mobile: "9506174051",
    whatsapp: "9506174051",
    parentMobile: "9839397162",
    email: "aradhy.gupta@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 88,
    status: "ACTIVE"
  },
  {
    id: "s1022",
    userId: "u-student-1022",
    rollNo: "SC-1022",
    name: "Sugam rana",
    class: "Class 6",
    fatherName: "Sunil Kumar",
    motherName: "Dayawati rana",
    dob: "4/15/2015",
    gender: "Male",
    address: "Sardar patel chok",
    mobile: "9451418351",
    whatsapp: "9451418351",
    parentMobile: "9451418351",
    email: "sugam.rana@sunshineclasses.net",
    preferredBatch: "Class 6 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1023",
    userId: "u-student-1023",
    rollNo: "SC-1023",
    name: "Pranjal pal",
    class: "Class 5",
    fatherName: "Pramod Kumar",
    motherName: "Sangeeta devi",
    dob: "7/20/2016",
    gender: "Male",
    address: "Muridkhani pihani",
    mobile: "6393020272",
    whatsapp: "6393020272",
    parentMobile: "6393020272",
    email: "pranjal.pal@sunshineclasses.net",
    preferredBatch: "Class 5 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 96,
    status: "ACTIVE"
  },
  {
    id: "s1024",
    userId: "u-student-1024",
    rollNo: "SC-1024",
    name: "Pranjal Awasthi",
    class: "Class 10",
    fatherName: "Guardian",
    motherName: "Mother",
    dob: "11/21/2010",
    gender: "Male",
    address: "Vill & PO - Mansoor Nagar, Distt Hardoi (UP) 241406",
    mobile: "9161651535",
    whatsapp: "9161651535",
    parentMobile: "9161651535",
    email: "pranjal.awasthi@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 99,
    status: "ACTIVE"
  },
  {
    id: "s1025",
    userId: "u-student-1025",
    rollNo: "SC-1025",
    name: "Shivam Verma",
    class: "Class 9",
    fatherName: "Mr. Satish Verma",
    motherName: "Mrs. Meena Verma",
    dob: "2012-07-14",
    gender: "Male",
    address: "Mohalla Mishrana, Pihani, Hardoi, UP",
    mobile: "9876543210",
    whatsapp: "9876543210",
    parentMobile: "9876543210",
    email: "shivam.verma@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1026",
    userId: "u-student-1026",
    rollNo: "SC-1026",
    name: "RUDRA PRATAP SINGH",
    class: "Class 8",
    fatherName: "MR. VIJAY PRATAP SINGH",
    motherName: "MRS. MEENU SINGH",
    dob: "1/1/2015",
    gender: "Male",
    address: "VILLAGE - UMARSENDA PIHANI ,HARDOI",
    mobile: "6388362168",
    whatsapp: "6388362168",
    parentMobile: "9724233271",
    email: "rudra.pratap.singh@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 99,
    status: "ACTIVE"
  },
  {
    id: "s1027",
    userId: "u-student-1027",
    rollNo: "SC-1027",
    name: "Roshni",
    class: "Class 9",
    fatherName: "Harishchandra singh",
    motherName: "Taravati",
    dob: "1/1/2012",
    gender: "Female",
    address: "Mavaiya post karim Nagar pihani (Hardoi)",
    mobile: "936957794",
    whatsapp: "936957794",
    parentMobile: "9792240601",
    email: "roshni@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1028",
    userId: "u-student-1028",
    rollNo: "SC-1028",
    name: "Bashar Rais",
    class: "Class 10",
    fatherName: "Mohd Rais Ansari",
    motherName: "Shamsheer Bano",
    dob: "3/11/2012",
    gender: "Male",
    address: "Near Rashidiya Masjid mohalla lohani pihani hardoi",
    mobile: "9129891682",
    whatsapp: "9129891682",
    parentMobile: "9450857743",
    email: "bashar.rais@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 90,
    status: "ACTIVE"
  },
  {
    id: "s1029",
    userId: "u-student-1029",
    rollNo: "SC-1029",
    name: "Anvi Srivastava",
    class: "Class 4",
    fatherName: "Mr.Abhishek Srivastava",
    motherName: "Mrs.Ruchi Srivastava",
    dob: "12/24/2016",
    gender: "Female",
    address: "Majhiya , Pihani",
    mobile: "7007419283",
    whatsapp: "7007419283",
    parentMobile: "7860667714",
    email: "anvi.srivastava@sunshineclasses.net",
    preferredBatch: "Class 4 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 99,
    status: "ACTIVE"
  },
  {
    id: "s1030",
    userId: "u-student-1030",
    rollNo: "SC-1030",
    name: "Mahi Zaidi",
    class: "Class 7",
    fatherName: "L.Qamar Hussain Zaidi",
    motherName: "Sana Zaidi",
    dob: "12/26/2013",
    gender: "Female",
    address: "Moh.Mishrana uttari Piyabagh",
    mobile: "9140870726",
    whatsapp: "9140870726",
    parentMobile: "9140870726",
    email: "mahi.zaidi@sunshineclasses.net",
    preferredBatch: "Class 7 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 96,
    status: "ACTIVE"
  },
  {
    id: "s1031",
    userId: "u-student-1031",
    rollNo: "SC-1031",
    name: "Ali Murtaza Zaidi",
    class: "Class 5",
    fatherName: "L.Qamar Hussain Zaidi",
    motherName: "Sana Zaidi",
    dob: "3/28/2017",
    gender: "Male",
    address: "Moh.mishrana uttari Piyabagh",
    mobile: "9140870726",
    whatsapp: "9140870726",
    parentMobile: "9140870726",
    email: "ali.murtaza.zaidi@sunshineclasses.net",
    preferredBatch: "Class 5 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 97,
    status: "ACTIVE"
  },
  {
    id: "s1032",
    userId: "u-student-1032",
    rollNo: "SC-1032",
    name: "Waqas  rais",
    class: "Class 6",
    fatherName: "Mohd rais ansari",
    motherName: "Shamsheer bano",
    dob: "7/22/2015",
    gender: "Male",
    address: "Mohalla lohani pihani hardoi",
    mobile: "7651943811",
    whatsapp: "7651943811",
    parentMobile: "9450857743",
    email: "waqas..rais@sunshineclasses.net",
    preferredBatch: "Class 6 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 92,
    status: "ACTIVE"
  },
  {
    id: "s1033",
    userId: "u-student-1033",
    rollNo: "SC-1033",
    name: "Aditi yadav",
    class: "Class 7",
    fatherName: "Mr. Deshraj shingh",
    motherName: "Mrs. Lakshmi",
    dob: "8/17/2015",
    gender: "Female",
    address: "Maheiya kheda pihani hardoi",
    mobile: "8429458515",
    whatsapp: "8429458515",
    parentMobile: "9170573755",
    email: "aditi.yadav@sunshineclasses.net",
    preferredBatch: "Class 7 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 95,
    status: "ACTIVE"
  },
  {
    id: "s1034",
    userId: "u-student-1034",
    rollNo: "SC-1034",
    name: "Aditi Agnihotri",
    class: "Class 8",
    fatherName: "Mr Arun Agnihotri",
    motherName: "Mrs Yachna Agnihotri",
    dob: "3/9/2012",
    gender: "Female",
    address: "Mohalla lohani pihani hardoi",
    mobile: "9115365975",
    whatsapp: "9115365975",
    parentMobile: "8299656837",
    email: "aditi.agnihotri@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 96,
    status: "ACTIVE"
  },
  {
    id: "s1035",
    userId: "u-student-1035",
    rollNo: "SC-1035",
    name: "Aryav singh",
    class: "Class 4",
    fatherName: "Mahendra pal verma",
    motherName: "Meena devi",
    dob: "6/8/2016",
    gender: "Male",
    address: "Ambedkar Nagar Pihani",
    mobile: "8887866720",
    whatsapp: "8887866720",
    parentMobile: "7355787614",
    email: "aryav.singh@sunshineclasses.net",
    preferredBatch: "Class 4 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 98,
    status: "ACTIVE"
  },
  {
    id: "s1036",
    userId: "u-student-1036",
    rollNo: "SC-1036",
    name: "Vaibhav singh",
    class: "Class 10",
    fatherName: "Ashutosh kumar",
    motherName: "Neelam kumari",
    dob: "11/19/2010",
    gender: "Male",
    address: "Pihani hardoi",
    mobile: "8953422755",
    whatsapp: "8953422755",
    parentMobile: "8953422755",
    email: "vaibhav.singh@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 90,
    status: "ACTIVE"
  },
  {
    id: "s1037",
    userId: "u-student-1037",
    rollNo: "SC-1037",
    name: "Ayushi saxena",
    class: "Class 8",
    fatherName: "Mr. Ramakant Saxena",
    motherName: "Mrs. Sunita saxena",
    dob: "2/23/2012",
    gender: "Female",
    address: "Moh- Mishrana,pihani,district-hardoi",
    mobile: "8299597203",
    whatsapp: "8299597203",
    parentMobile: "8299597203",
    email: "ayushi.saxena@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 97,
    status: "ACTIVE"
  },
  {
    id: "s1038",
    userId: "u-student-1038",
    rollNo: "SC-1038",
    name: "Meera Kapoor",
    class: "Class 10",
    fatherName: "Mr. Rakesh Kapoor",
    motherName: "Mrs. Sunita Kapoor",
    dob: "2011-09-18",
    gender: "Female",
    address: "Circular Road, Pihani, Hardoi, UP",
    mobile: "9450123456",
    whatsapp: "9450123456",
    parentMobile: "9450123456",
    email: "meera.kapoor@sunshineclasses.net",
    preferredBatch: "Class 10 - Main Batch",
    preferredTiming: "07:00 AM - 09:30 AM",
    admissionDate: "2026-06-27",
    attendancePercentage: 95,
    status: "ACTIVE"
  },
  {
    id: "s1039",
    userId: "u-student-1039",
    rollNo: "SC-1039",
    name: "Rohan Gupta",
    class: "Class 9",
    fatherName: "Mr. Manoj Gupta",
    motherName: "Mrs. Sangeeta Gupta",
    dob: "2012-12-05",
    gender: "Male",
    address: "Station Road, Pihani, Hardoi, UP",
    mobile: "9451234567",
    whatsapp: "9451234567",
    parentMobile: "9451234567",
    email: "rohan.gupta@sunshineclasses.net",
    preferredBatch: "Class 9 - Main Batch",
    preferredTiming: "04:00 PM - 06:30 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 91,
    status: "ACTIVE"
  },
  {
    id: "s1040",
    userId: "u-student-1040",
    rollNo: "SC-1040",
    name: "Tanvi Joshi",
    class: "Class 8",
    fatherName: "Mr. Alok Joshi",
    motherName: "Mrs. Rekha Joshi",
    dob: "2013-03-22",
    gender: "Female",
    address: "Main Bazar, Pihani, Hardoi, UP",
    mobile: "9452345678",
    whatsapp: "9452345678",
    parentMobile: "9452345678",
    email: "tanvi.joshi@sunshineclasses.net",
    preferredBatch: "Class 8 - Main Batch",
    preferredTiming: "02:00 PM - 04:00 PM",
    admissionDate: "2026-06-27",
    attendancePercentage: 94,
    status: "ACTIVE"
  }
];

export const SEED_USERS: User[] = [
  // Super Admin 1: Priyanshu Gupta (Founder)
  {
    id: 'u-priyanshu',
    username: 'priyanshu',
    name: 'Priyanshu Gupta (Founder)',
    email: 'sunshineclassespihani@gmail.com',
    role: 'SUPER_ADMIN',
    phone: '9999900000',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // Super Admin 2: Rajeev Kumar Verma (Co-Founder)
  {
    id: 'u-rajeev',
    username: 'rajeev',
    name: 'Rajeev Kumar Verma (Co-Founder)',
    email: 'kumarvermarajeev79@gmail.com',
    role: 'SUPER_ADMIN',
    phone: '9999900001',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // Super Admin generic profile for administrative team sharing
  {
    id: 'u-superadmin',
    username: 'superadmin',
    name: 'Super Administrator',
    email: 'superadmin@sunshineclasses.net',
    role: 'SUPER_ADMIN',
    phone: '9999900000',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // Founder / Super Admin aliases for backwards-compatibility & easy logins
  {
    id: 'u-founder',
    username: 'founder',
    name: 'Priyanshu Gupta (Founder)',
    email: 'founder@sunshineclasses.net',
    role: 'SUPER_ADMIN',
    phone: '9999900000',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  {
    id: 'u-cofounder',
    username: 'cofounder',
    name: 'Rajeev Kumar Verma (Co-Founder)',
    email: 'cofounder@sunshineclasses.net',
    role: 'SUPER_ADMIN',
    phone: '9999900001',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // General Admin
  {
    id: 'u-admin',
    username: 'admin',
    name: 'Institute Admin',
    email: 'admin@sunshineclasses.net',
    role: 'ADMIN',
    phone: '9999922222',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // Receptionist Desk
  {
    id: 'u-reception',
    username: 'reception',
    name: 'Receptionist Desk',
    email: 'reception@sunshineclasses.net',
    role: 'RECEPTIONIST',
    phone: '9999933333',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // Test Teachers
  {
    id: 'u-teacher-1',
    username: 'teacher',
    name: 'Priyanshu Gupta (Teacher)',
    email: 'priyanshu.teacher@sunshineclasses.net',
    role: 'TEACHER',
    phone: '9999900004',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  {
    id: 'u-teacher-2',
    username: 'amit.sharma',
    name: 'Amit Sharma',
    email: 'amit.teacher@sunshineclasses.net',
    role: 'TEACHER',
    phone: '9999900012',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  {
    id: 'u-teacher-3',
    username: 'neha.singh',
    name: 'Neha Singh',
    email: 'neha.teacher@sunshineclasses.net',
    role: 'TEACHER',
    phone: '9999900013',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  // Test Students
  {
    id: 'u-student-1',
    username: 'student',
    name: 'Rahul Verma',
    email: 'rahul.verma@sunshineclasses.net',
    role: 'STUDENT',
    phone: '9999900005',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  {
    id: 'u-student-2',
    username: 'ananya.sharma',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@sunshineclasses.net',
    role: 'STUDENT',
    phone: '9999900021',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  },
  {
    id: 'u-student-3',
    username: 'aryan.patel',
    name: 'Aryan Patel',
    email: 'aryan.patel@sunshineclasses.net',
    role: 'STUDENT',
    phone: '9999900031',
    password: 'Sunshine123',
    passwordHash: 'Sunshine123',
    status: 'ACTIVE',
    active: true,
    mustChangePassword: false,
    forcePasswordChange: false
  }
];

export const SEED_ADMISSIONS: Admission[] = [
  {
    id: 'ADM-2026-001',
    enrollmentId: 'ENR-2026-001',
    userId: 'u-student-1',
    studentName: 'Rahul Verma',
    fatherName: 'Suresh Verma',
    motherName: 'Sunita Verma',
    dob: '2010-04-15',
    gender: 'Male',
    className: 'Class 10',
    previousSchool: 'St. Xavier High School',
    mobile: '9876543210',
    parentMobile: '9876543210',
    email: 'rahul.verma@sunshineclasses.net',
    address: '14/2 Railway Colony, Varanasi',
    board: 'CBSE',
    preferredStartMonth: 'April 2026',
    paymentPlan: 'Monthly',
    preferredBatch: 'Class 10 - Morning',
    preferredTiming: '07:00 AM – 09:30 AM',
    monthlyFee: 1200,
    status: 'APPROVED',
    date: '2026-04-01'
  },
  {
    id: 'ADM-2026-002',
    enrollmentId: 'ENR-2026-002',
    userId: 'u-student-2',
    studentName: 'Ananya Sharma',
    fatherName: 'Rajesh Sharma',
    motherName: 'Poonam Sharma',
    dob: '2011-08-22',
    gender: 'Female',
    className: 'Class 9',
    previousSchool: 'Delhi Public School',
    mobile: '9876543211',
    parentMobile: '9876543211',
    email: 'ananya.sharma@sunshineclasses.net',
    address: 'Flat 302, Sunrise Apts, Varanasi',
    board: 'CBSE',
    preferredStartMonth: 'April 2026',
    paymentPlan: 'Monthly',
    preferredBatch: 'Class 9 - Evening',
    preferredTiming: '03:00 PM – 05:00 PM',
    monthlyFee: 1000,
    status: 'APPROVED',
    date: '2026-04-03'
  },
  {
    id: 'ADM-2026-003',
    enrollmentId: 'ENR-2026-003',
    userId: 'u-student-3',
    studentName: 'Aryan Patel',
    fatherName: 'Ramesh Patel',
    motherName: 'Geeta Patel',
    dob: '2012-01-10',
    gender: 'Male',
    className: 'Class 8',
    previousSchool: 'Kendriya Vidyalaya',
    mobile: '9876543212',
    parentMobile: '9876543212',
    email: 'aryan.patel@sunshineclasses.net',
    address: '56 New Cantt Road, Varanasi',
    board: 'CBSE',
    preferredStartMonth: 'April 2026',
    paymentPlan: 'Monthly',
    preferredBatch: 'Class 8 - Afternoon',
    preferredTiming: '02:00 PM – 04:00 PM',
    monthlyFee: 700,
    status: 'APPROVED',
    date: '2026-04-05'
  },
  {
    id: 'ADM-2026-004',
    enrollmentId: 'ENR-2026-004',
    studentName: 'Meera Kapoor',
    fatherName: 'Vikram Kapoor',
    motherName: 'Anita Kapoor',
    dob: '2010-11-14',
    gender: 'Female',
    className: 'Class 10',
    previousSchool: 'City Montessori School',
    mobile: '9876543220',
    parentMobile: '9876543220',
    email: 'meera.kapoor@sunshineclasses.net',
    address: 'Mohalla Lohani, Pihani, Hardoi, UP - 241406',
    board: 'ICSE',
    preferredStartMonth: 'July 2026',
    paymentPlan: 'Quarterly',
    preferredBatch: 'Class 10 - Evening',
    preferredTiming: '04:00 PM – 06:30 PM',
    monthlyFee: 1200,
    status: 'PENDING',
    date: '2026-07-02'
  },
  {
    id: 'ADM-2026-005',
    enrollmentId: 'ENR-2026-005',
    studentName: 'Rohan Gupta',
    fatherName: 'Manoj Gupta',
    motherName: 'Kiran Gupta',
    dob: '2011-05-19',
    gender: 'Male',
    className: 'Class 9',
    previousSchool: 'Sunbeam Academy',
    mobile: '9876543221',
    parentMobile: '9876543221',
    email: 'rohan.gupta@sunshineclasses.net',
    address: 'Mohalla Qila, Pihani, Hardoi, UP - 241406',
    board: 'CBSE',
    preferredStartMonth: 'July 2026',
    paymentPlan: 'Monthly',
    preferredBatch: 'Class 9 - Evening',
    preferredTiming: '03:00 PM – 05:00 PM',
    monthlyFee: 1000,
    status: 'PENDING',
    date: '2026-07-05'
  },
  {
    id: 'ADM-2026-006',
    enrollmentId: 'ENR-2026-006',
    studentName: 'Tanvi Joshi',
    fatherName: 'Deepak Joshi',
    motherName: 'Sangeeta Joshi',
    dob: '2012-09-08',
    gender: 'Female',
    className: 'Class 8',
    previousSchool: 'St. John Convent',
    mobile: '9876543222',
    parentMobile: '9876543222',
    email: 'tanvi.joshi@sunshineclasses.net',
    address: 'Railway Ganj, Hardoi, UP - 241001',
    board: 'UP Board',
    preferredStartMonth: 'August 2026',
    paymentPlan: 'Monthly',
    preferredBatch: 'Class 8 - Afternoon',
    preferredTiming: '02:00 PM – 04:00 PM',
    monthlyFee: 700,
    status: 'NEED_MORE_INFO',
    requestedChanges: 'Please upload recent marksheet and transfer certificate.',
    date: '2026-07-08'
  }
];

export const SEED_ATTENDANCE: Attendance[] = [
  // Attendance history for s1 (Rahul Verma)
  { id: 'at1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-24', status: 'PRESENT', markedBy: 'Priyanshu Gupta' },
  { id: 'at2', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-25', status: 'PRESENT', markedBy: 'Priyanshu Gupta' },
  { id: 'at3', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-26', status: 'LATE', markedBy: 'Priyanshu Gupta' },
  { id: 'at4', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', date: '2026-06-27', status: 'PRESENT', markedBy: 'Priyanshu Gupta' },
  // Attendance history for s2 (Ananya Sharma)
  { id: 'at5', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', date: '2026-06-24', status: 'PRESENT', markedBy: 'Neha Singh' },
  { id: 'at6', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', date: '2026-06-25', status: 'PRESENT', markedBy: 'Neha Singh' },
  { id: 'at7', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', date: '2026-06-26', status: 'PRESENT', markedBy: 'Neha Singh' },
  { id: 'at8', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', date: '2026-06-27', status: 'PRESENT', markedBy: 'Neha Singh' },
  // Attendance history for s3 (Aryan Patel)
  { id: 'at9', studentId: 's3', studentName: 'Aryan Patel', class: 'Class 8', date: '2026-06-25', status: 'PRESENT', markedBy: 'Amit Sharma' },
  { id: 'at10', studentId: 's3', studentName: 'Aryan Patel', class: 'Class 8', date: '2026-06-26', status: 'ABSENT', markedBy: 'Amit Sharma' },
  { id: 'at11', studentId: 's3', studentName: 'Aryan Patel', class: 'Class 8', date: '2026-06-27', status: 'PRESENT', markedBy: 'Amit Sharma' }
];

export const SEED_FEE_STATUS: FeeStatus[] = [
  { id: 'fs1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', month: 'June 2026', totalFee: 1500, discount: 0, scholarship: 0, paidFee: 1500, pendingFee: 0, status: 'PAID', dueDate: '2026-06-10' },
  { id: 'fs2', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', month: 'July 2026', totalFee: 1500, discount: 0, scholarship: 0, paidFee: 0, pendingFee: 1500, status: 'PENDING', dueDate: '2026-07-10' },
  { id: 'fs3', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', month: 'June 2026', totalFee: 1200, discount: 0, scholarship: 0, paidFee: 1200, pendingFee: 0, status: 'PAID', dueDate: '2026-06-10' },
  { id: 'fs4', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', month: 'July 2026', totalFee: 1200, discount: 0, scholarship: 0, paidFee: 0, pendingFee: 1200, status: 'PENDING', dueDate: '2026-07-10' },
  { id: 'fs5', studentId: 's3', studentName: 'Aryan Patel', class: 'Class 8', month: 'June 2026', totalFee: 1000, discount: 0, scholarship: 0, paidFee: 1000, pendingFee: 0, status: 'PAID', dueDate: '2026-06-10' },
  { id: 'fs6', studentId: 's3', studentName: 'Aryan Patel', class: 'Class 8', month: 'July 2026', totalFee: 1000, discount: 0, scholarship: 0, paidFee: 0, pendingFee: 1000, status: 'PENDING', dueDate: '2026-07-10' }
];

export const SEED_FEE_RECEIPTS: FeeReceipt[] = [];

export const SEED_TESTS: Test[] = [
  { id: 'tst1', title: 'Mathematics Chapter 1 & 2', class: 'Class 10', subject: 'Mathematics', chapter: 'Real Numbers & Polynomials', totalMarks: 50, date: '2026-06-15', highestMarks: 49, averageMarks: 38 },
  { id: 'tst2', title: 'Science Mechanics Test', class: 'Class 10', subject: 'Science', chapter: 'Light Reflection & Refraction', totalMarks: 30, date: '2026-06-20', highestMarks: 28, averageMarks: 22 },
  { id: 'tst3', title: 'English Grammar Assessment', class: 'Class 10', subject: 'English', chapter: 'Tenses & Active-Passive Voice', totalMarks: 25, date: '2026-06-22', highestMarks: 24, averageMarks: 18 },
  { id: 'tst4', title: 'Class 9 Algebra & Linear Equations', class: 'Class 9', subject: 'Mathematics', chapter: 'Linear Equations in Two Variables', totalMarks: 40, date: '2026-06-18', highestMarks: 39, averageMarks: 31 },
  { id: 'tst5', title: 'Class 8 Force & Pressure Assessment', class: 'Class 8', subject: 'Science', chapter: 'Force and Pressure', totalMarks: 30, date: '2026-06-19', highestMarks: 29, averageMarks: 24 }
];

export const SEED_STUDENT_MARKS: StudentMark[] = [
  // Math Test (tst1) results
  { id: 'm1', testId: 'tst1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', marksObtained: 46, remarks: 'Excellent logical skills. Keep it up!', rank: 1 },
  // Science Test (tst2) results
  { id: 'm2', testId: 'tst2', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', marksObtained: 27, remarks: 'Good score, revise ray diagrams', rank: 1 },
  // Class 9 Math Test (tst4)
  { id: 'm3', testId: 'tst4', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', marksObtained: 38, remarks: 'Top performance in algebra!', rank: 1 },
  // Class 8 Science Test (tst5)
  { id: 'm4', testId: 'tst5', studentId: 's3', studentName: 'Aryan Patel', class: 'Class 8', marksObtained: 28, remarks: 'Very clear conceptual understanding.', rank: 1 }
];

export const SEED_HOMEWORK: Homework[] = [
  { id: 'hw1', title: 'Quadratic Equations Exercise 4.2', description: 'Solve all questions from Exercise 4.2 of NCERT textbook and show steps clearly in your notebook.', class: 'Class 10', subject: 'Mathematics', date: '2026-06-25', dueDate: '2026-06-28', teacherId: 't1', teacherName: 'Priyanshu Gupta' },
  { id: 'hw2', title: 'Chemical Reactions Balancing', description: 'Balance the 15 equations provided in the sheet. Upload a clean photograph or PDF of the completed work.', class: 'Class 10', subject: 'Science', date: '2026-06-26', dueDate: '2026-06-29', teacherId: 't2', teacherName: 'Amit Sharma' },
  { id: 'hw3', title: 'Class 9 Coordinate Geometry Practice', description: 'Complete questions 1 to 8 from textbook section 3.2.', class: 'Class 9', subject: 'Mathematics', date: '2026-06-25', dueDate: '2026-06-28', teacherId: 't1', teacherName: 'Priyanshu Gupta' },
  { id: 'hw4', title: 'Class 8 Cell Structure Diagram & Notes', description: 'Draw labeled diagrams of Plant Cell vs Animal Cell.', class: 'Class 8', subject: 'Science', date: '2026-06-26', dueDate: '2026-06-29', teacherId: 't2', teacherName: 'Amit Sharma' }
];

export const SEED_HOMEWORK_SUBMISSIONS: HomeworkSubmission[] = [
  { id: 'hs1', homeworkId: 'hw1', studentId: 's1', studentName: 'Rahul Verma', class: 'Class 10', submissionDate: '2026-06-27', textAnswer: 'Completed all 10 questions of Exercise 4.2. Roots calculated correctly.', status: 'SUBMITTED' },
  { id: 'hs2', homeworkId: 'hw3', studentId: 's2', studentName: 'Ananya Sharma', class: 'Class 9', submissionDate: '2026-06-27', textAnswer: 'Plotted all coordinate points on graph paper and verified quadrants.', status: 'SUBMITTED' }
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
    title: 'CBSE Class 10 Mathematics Standard Official Sample Paper 2024-25',
    slug: 'cbse-class-10-maths-standard-official-sample-paper',
    description: 'Official CBSE board sample question paper for Class 10 Mathematics (Standard) released by CBSE Academic with Section A to E questions.',
    desc: 'Official CBSE board sample question paper for Class 10 Mathematics Standard.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'All Chapters (Full Syllabus)',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_maths_sqp.pdf',
    size: '1.4 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/Maths-SQP.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1420,
    viewCount: 4890,
    tags: ['CBSE Official', 'Class 10', 'Mathematics', 'Sample Paper', 'Board Exam', '2025'],
    seoTitle: 'CBSE Class 10 Maths Standard Official Sample Paper PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Mathematics Standard sample question paper released by CBSE Academic for board preparation.',
    keywords: ['CBSE Class 10 Maths', 'Official Sample Paper', 'CBSE SQP', 'Maths Standard Board'],
    createdBy: 'CBSE Academic / Priyanshu Gupta',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-15T12:00:00Z',
    date: '2026-06-01'
  },
  {
    id: 'mat2',
    materialId: 'mat2',
    title: 'CBSE Class 10 Mathematics Official Marking Scheme & Step Solutions',
    slug: 'cbse-class-10-maths-official-marking-scheme',
    description: 'Official CBSE marking scheme with step-by-step marking rubrics, value points, and complete answers for Class 10 Mathematics Standard.',
    desc: 'Official CBSE marking scheme and solutions for Class 10 Mathematics.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'All Chapters',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_maths_marking_scheme.pdf',
    size: '1.1 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/Maths-MS.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1280,
    viewCount: 3950,
    tags: ['CBSE Official', 'Class 10', 'Mathematics', 'Marking Scheme', 'Step Marking'],
    seoTitle: 'CBSE Class 10 Maths Official Marking Scheme PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE marking scheme for Class 10 Mathematics with step-wise marks distribution.',
    keywords: ['CBSE Marking Scheme', 'Class 10 Maths Answers', 'Board Step Marking'],
    createdBy: 'CBSE Academic / Priyanshu Gupta',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-16T12:00:00Z',
    date: '2026-06-02'
  },
  {
    id: 'mat3',
    materialId: 'mat3',
    title: 'CBSE Class 10 Science Official Board Sample Question Paper',
    slug: 'cbse-class-10-science-official-sample-paper',
    description: 'Official 80-mark CBSE Class 10 Science board sample paper covering Physics numericals, Chemistry reactions, Biology diagrams, and case-based questions.',
    desc: 'Official CBSE Class 10 Science sample question paper with section-wise questions.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'All Chapters (Full Syllabus)',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_science_sqp.pdf',
    size: '1.6 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/Science-SQP.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1530,
    viewCount: 5210,
    tags: ['CBSE Official', 'Class 10', 'Science', 'Sample Paper', 'Board Exam', 'Physics', 'Chemistry'],
    seoTitle: 'CBSE Class 10 Science Official Sample Paper PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Science sample question paper released by CBSE Academic for board exams.',
    keywords: ['CBSE Class 10 Science', 'Science Sample Paper', 'CBSE Academic Science'],
    createdBy: 'CBSE Academic / Rajeev Kr. Verma',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-03T11:00:00Z',
    updatedAt: '2026-06-17T14:00:00Z',
    date: '2026-06-03'
  },
  {
    id: 'mat4',
    materialId: 'mat4',
    title: 'CBSE Class 10 Science Official Marking Scheme & Answer Keys',
    slug: 'cbse-class-10-science-official-marking-scheme',
    description: 'Official CBSE evaluation scheme and detailed answers for Class 10 Science board examinations with key chemical equations and balanced formulas.',
    desc: 'Official CBSE evaluation scheme and answers for Class 10 Science.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'All Chapters',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_science_marking_scheme.pdf',
    size: '980 KB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/Science-MS.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1190,
    viewCount: 3820,
    tags: ['CBSE Official', 'Class 10', 'Science', 'Marking Scheme', 'Answer Key'],
    seoTitle: 'CBSE Class 10 Science Official Marking Scheme PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE marking scheme for Class 10 Science board exam.',
    keywords: ['CBSE Science Marking Scheme', 'Class 10 Science Solutions', 'Board Answers'],
    createdBy: 'CBSE Academic / Rajeev Kr. Verma',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-04T11:00:00Z',
    updatedAt: '2026-06-18T14:30:00Z',
    date: '2026-06-04'
  },
  {
    id: 'mat5',
    materialId: 'mat5',
    title: 'CBSE Class 10 Mathematics Official Chapter-Wise Question Bank',
    slug: 'cbse-class-10-mathematics-official-question-bank',
    description: 'Official comprehensive question bank compiled by CBSE Academic containing hundreds of practice problems, assertion-reason sets, and case studies.',
    desc: 'Official comprehensive CBSE Mathematics practice question bank.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'All Chapters',
    materialType: 'QUESTION_BANK',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_maths_question_bank.pdf',
    size: '5.2 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/QuestionBank/ClassX/MathsX.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 2150,
    viewCount: 6840,
    tags: ['CBSE Official', 'Class 10', 'Mathematics', 'Question Bank', 'Practice Questions'],
    seoTitle: 'CBSE Class 10 Maths Official Question Bank PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Mathematics Question Bank prepared by CBSE Academic for board exam success.',
    keywords: ['CBSE Question Bank', 'Class 10 Maths Questions', 'CBSE Academic Question Bank'],
    createdBy: 'CBSE Academic / Priyanshu Gupta',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-05T08:00:00Z',
    updatedAt: '2026-06-19T10:00:00Z',
    date: '2026-06-05'
  },
  {
    id: 'mat6',
    materialId: 'mat6',
    title: 'CBSE Class 10 Science Official Chapter-Wise Question Bank',
    slug: 'cbse-class-10-science-official-question-bank',
    description: 'Official CBSE Academic question repository for Class 10 Science featuring competency-based questions, case-study questions, and practical-based problems.',
    desc: 'Official CBSE Science question repository with competency problems.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'All Chapters',
    materialType: 'QUESTION_BANK',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_science_question_bank.pdf',
    size: '4.8 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/QuestionBank/ClassX/ScienceX.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1980,
    viewCount: 6100,
    tags: ['CBSE Official', 'Class 10', 'Science', 'Question Bank', 'Competency Based'],
    seoTitle: 'CBSE Class 10 Science Official Question Bank PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Science Question Bank with competency-based problems.',
    keywords: ['CBSE Science Question Bank', 'Competency Questions', 'Class 10 Science'],
    createdBy: 'CBSE Academic / Rajeev Kr. Verma',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-06T09:00:00Z',
    updatedAt: '2026-06-20T11:00:00Z',
    date: '2026-06-06'
  },
  {
    id: 'mat7',
    materialId: 'mat7',
    title: 'CBSE Class 10 English Language & Literature Official Sample Paper',
    slug: 'cbse-class-10-english-official-sample-paper',
    description: 'Official CBSE Class 10 English Language & Literature model paper covering Reading Skills (Unseen Passages), Writing & Grammar, and Literature Section.',
    desc: 'Official CBSE Class 10 English Language & Literature sample question paper.',
    class: 'Class 10',
    subject: 'English',
    chapter: 'Full English Syllabus',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_english_sqp.pdf',
    size: '1.2 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/EnglishLang-SQP.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 940,
    viewCount: 3100,
    tags: ['CBSE Official', 'Class 10', 'English', 'Sample Paper', 'Grammar', 'Literature'],
    seoTitle: 'CBSE Class 10 English Official Sample Paper PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 English sample paper with Reading, Writing, and Literature sections.',
    keywords: ['CBSE English Sample Paper', 'Class 10 English SQP', 'CBSE English Language'],
    createdBy: 'CBSE Academic / Ritu Singh',
    uploadedBy: 'Ritu Singh (Teacher)',
    createdAt: '2026-06-07T10:00:00Z',
    updatedAt: '2026-06-21T12:00:00Z',
    date: '2026-06-07'
  },
  {
    id: 'mat8',
    materialId: 'mat8',
    title: 'CBSE Class 10 Social Science Official Board Sample Paper',
    slug: 'cbse-class-10-social-science-official-sample-paper',
    description: 'Official 80-mark CBSE Class 10 Social Science board question paper covering History, Geography, Political Science, Economics, and Map work.',
    desc: 'Official CBSE Class 10 Social Science sample paper with Map work.',
    class: 'Class 10',
    subject: 'Social Studies',
    chapter: 'Full SST Syllabus',
    materialType: 'SAMPLE_PAPER',
    category: 'QUESTION_PAPER',
    file: 'cbse_class10_sst_sqp.pdf',
    size: '1.5 MB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/SocialScience-SQP.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 870,
    viewCount: 2950,
    tags: ['CBSE Official', 'Class 10', 'Social Studies', 'History', 'Geography', 'Civics', 'Map Work'],
    seoTitle: 'CBSE Class 10 Social Science Official Sample Paper PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Social Science sample question paper with map pointing questions.',
    keywords: ['CBSE SST Sample Paper', 'Class 10 Social Science', 'CBSE Social Science SQP'],
    createdBy: 'CBSE Academic / Ritu Singh',
    uploadedBy: 'Ritu Singh (Teacher)',
    createdAt: '2026-06-08T11:00:00Z',
    updatedAt: '2026-06-22T14:00:00Z',
    date: '2026-06-08'
  },
  {
    id: 'mat9',
    materialId: 'mat9',
    title: 'CBSE Class 10 Mathematics Official Curriculum & Blueprint',
    slug: 'cbse-class-10-mathematics-curriculum-blueprint',
    description: 'Official CBSE curriculum document specifying chapter-wise marks distribution, internal assessment breakdown, deleted topics, and exam question typology.',
    desc: 'Official CBSE syllabus and chapter marks distribution for Mathematics.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Official Curriculum',
    materialType: 'SYLLABUS',
    category: 'NOTES',
    file: 'cbse_class10_maths_curriculum.pdf',
    size: '850 KB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/CurriculumMain25/Sec/Maths_Sec_2024-25.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1100,
    viewCount: 3600,
    tags: ['CBSE Official', 'Class 10', 'Mathematics', 'Syllabus', 'Blueprint', 'Marks Distribution'],
    seoTitle: 'CBSE Class 10 Maths Official Curriculum & Blueprint PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Mathematics syllabus and chapter-wise marks blueprint.',
    keywords: ['CBSE Class 10 Maths Syllabus', 'Mathematics Blueprint', 'CBSE Curriculum'],
    createdBy: 'CBSE Academic / Priyanshu Gupta',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-09T08:30:00Z',
    updatedAt: '2026-06-23T10:00:00Z',
    date: '2026-06-09'
  },
  {
    id: 'mat10',
    materialId: 'mat10',
    title: 'CBSE Class 10 Science Official Curriculum & Practical Guidelines',
    slug: 'cbse-class-10-science-curriculum-guidelines',
    description: 'Official CBSE Science curriculum breakdown with list of prescribed laboratory experiments, assessment rubrics, and board question paper design.',
    desc: 'Official CBSE Science syllabus and laboratory practical guidelines.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'Official Curriculum & Practicals',
    materialType: 'SYLLABUS',
    category: 'NOTES',
    file: 'cbse_class10_science_curriculum.pdf',
    size: '920 KB',
    fileUrl: 'https://cbseacademic.nic.in/web_material/CurriculumMain25/Sec/Science_Sec_2024-25.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 990,
    viewCount: 3340,
    tags: ['CBSE Official', 'Class 10', 'Science', 'Curriculum', 'Practicals', 'Lab Manual'],
    seoTitle: 'CBSE Class 10 Science Official Curriculum PDF - Sunshine Classes',
    metaDescription: 'Download official CBSE Class 10 Science curriculum and laboratory practical guidelines.',
    keywords: ['CBSE Science Syllabus', 'Science Practicals', 'Class 10 Blueprint'],
    createdBy: 'CBSE Academic / Rajeev Kr. Verma',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-24T11:00:00Z',
    date: '2026-06-10'
  },
  {
    id: 'mat11',
    materialId: 'mat11',
    title: 'NCERT Class 10 Mathematics Chapter 1: Real Numbers (Official Book)',
    slug: 'ncert-class-10-maths-chapter-1-real-numbers',
    description: 'Official NCERT textbook chapter covering Fundamental Theorem of Arithmetic, proving irrationality of √2, √3, √5, and solved examples.',
    desc: 'Official NCERT textbook chapter 1 on Real Numbers.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Real Numbers',
    materialType: 'PDF',
    category: 'NOTES',
    file: 'ncert_class10_maths_ch1.pdf',
    size: '1.1 MB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jemh101.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1650,
    viewCount: 5400,
    tags: ['NCERT Official', 'Class 10', 'Mathematics', 'Real Numbers', 'Textbook'],
    seoTitle: 'NCERT Class 10 Maths Chapter 1 Real Numbers PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 10 Mathematics Chapter 1 Real Numbers textbook PDF.',
    keywords: ['NCERT Class 10 Maths', 'Real Numbers PDF', 'NCERT Textbook Chapter 1'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-11T10:00:00Z',
    updatedAt: '2026-06-25T12:00:00Z',
    date: '2026-06-11'
  },
  {
    id: 'mat12',
    materialId: 'mat12',
    title: 'NCERT Class 10 Mathematics Chapter 8: Introduction to Trigonometry',
    slug: 'ncert-class-10-maths-chapter-8-trigonometry',
    description: 'Official NCERT textbook chapter covering trigonometric ratios, specific angles values (0°, 30°, 45°, 60°, 90°), and trigonometric identities.',
    desc: 'Official NCERT textbook chapter 8 on Introduction to Trigonometry.',
    class: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Chapter 8: Trigonometry',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'ncert_class10_maths_ch8.pdf',
    size: '1.3 MB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jemh108.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1840,
    viewCount: 6200,
    tags: ['NCERT Official', 'Class 10', 'Mathematics', 'Trigonometry', 'Formulas', 'Identities'],
    seoTitle: 'NCERT Class 10 Maths Chapter 8 Trigonometry PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 10 Mathematics Chapter 8 Trigonometry textbook PDF.',
    keywords: ['NCERT Trigonometry', 'Class 10 Trigonometry PDF', 'Trigonometric Ratios'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-12T10:30:00Z',
    updatedAt: '2026-06-26T12:00:00Z',
    date: '2026-06-12'
  },
  {
    id: 'mat13',
    materialId: 'mat13',
    title: 'NCERT Class 10 Science Chapter 1: Chemical Reactions & Equations',
    slug: 'ncert-class-10-science-chapter-1-chemical-reactions',
    description: 'Official NCERT textbook chapter covering writing balanced equations, types of chemical reactions, combination, decomposition, displacement, and redox.',
    desc: 'Official NCERT textbook chapter 1 on Chemical Reactions & Equations.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'Chapter 1: Chemical Reactions',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'ncert_class10_science_ch1.pdf',
    size: '1.8 MB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jesc101.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1920,
    viewCount: 6400,
    tags: ['NCERT Official', 'Class 10', 'Science', 'Chemistry', 'Chemical Reactions'],
    seoTitle: 'NCERT Class 10 Science Chapter 1 Chemical Reactions PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 10 Science Chapter 1 Chemical Reactions & Equations textbook PDF.',
    keywords: ['NCERT Class 10 Chemistry', 'Chemical Reactions PDF', 'NCERT Science Chapter 1'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-13T11:00:00Z',
    updatedAt: '2026-06-27T13:00:00Z',
    date: '2026-06-13'
  },
  {
    id: 'mat14',
    materialId: 'mat14',
    title: 'NCERT Class 10 Science Chapter 5: Life Processes (Official Textbook)',
    slug: 'ncert-class-10-science-chapter-5-life-processes',
    description: 'Official NCERT textbook chapter covering nutrition in plants & humans, cellular respiration, transportation (human heart, xylem/phloem), and excretion.',
    desc: 'Official NCERT textbook chapter on Life Processes with diagrams.',
    class: 'Class 10',
    subject: 'Science',
    chapter: 'Chapter 5: Life Processes',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'ncert_class10_science_ch5.pdf',
    size: '2.2 MB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jesc105.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 2210,
    viewCount: 7300,
    tags: ['NCERT Official', 'Class 10', 'Science', 'Biology', 'Life Processes', 'Human Heart'],
    seoTitle: 'NCERT Class 10 Science Chapter 5 Life Processes PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 10 Science Chapter 5 Life Processes textbook PDF.',
    keywords: ['NCERT Life Processes', 'Class 10 Biology PDF', 'Human Heart Diagram'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-14T11:30:00Z',
    updatedAt: '2026-06-28T14:00:00Z',
    date: '2026-06-14'
  },
  {
    id: 'mat15',
    materialId: 'mat15',
    title: 'NCERT Class 9 Mathematics Chapter 1: Number Systems (Official Book)',
    slug: 'ncert-class-9-maths-chapter-1-number-systems',
    description: 'Official NCERT textbook chapter covering irrational numbers, real numbers and decimal expansions, operations on real numbers, and laws of exponents.',
    desc: 'Official NCERT textbook chapter 1 for Class 9 Mathematics.',
    class: 'Class 9',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Number Systems',
    materialType: 'PDF',
    category: 'NOTES',
    file: 'ncert_class9_maths_ch1.pdf',
    size: '1.0 MB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/iemh101.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1040,
    viewCount: 3400,
    tags: ['NCERT Official', 'Class 9', 'Mathematics', 'Number Systems', 'Textbook'],
    seoTitle: 'NCERT Class 9 Maths Chapter 1 Number Systems PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 9 Mathematics Chapter 1 Number Systems textbook PDF.',
    keywords: ['NCERT Class 9 Maths', 'Number Systems PDF', 'Class 9 Maths Book'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-29T11:00:00Z',
    date: '2026-06-15'
  },
  {
    id: 'mat16',
    materialId: 'mat16',
    title: 'NCERT Class 9 Science Chapter 7: Motion (Official Textbook)',
    slug: 'ncert-class-9-science-chapter-7-motion',
    description: 'Official NCERT textbook chapter on describing motion, uniform and non-uniform motion, rate of change of velocity, graphical representation, and equations of motion.',
    desc: 'Official NCERT textbook chapter on Motion and velocity graphs.',
    class: 'Class 9',
    subject: 'Science',
    chapter: 'Chapter 7: Motion',
    materialType: 'WORKSHEET',
    category: 'NOTES',
    file: 'ncert_class9_science_motion.pdf',
    size: '1.4 MB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/iesc107.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 1180,
    viewCount: 3750,
    tags: ['NCERT Official', 'Class 9', 'Science', 'Physics', 'Motion', 'Graphs'],
    seoTitle: 'NCERT Class 9 Science Chapter 7 Motion PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 9 Science Chapter 7 Motion textbook chapter PDF.',
    keywords: ['NCERT Class 9 Physics', 'Motion Chapter PDF', 'Equations of Motion'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-16T10:00:00Z',
    updatedAt: '2026-06-30T12:00:00Z',
    date: '2026-06-16'
  },
  {
    id: 'mat17',
    materialId: 'mat17',
    title: 'NCERT Class 8 Mathematics Chapter 1: Rational Numbers (Official Book)',
    slug: 'ncert-class-8-maths-chapter-1-rational-numbers',
    description: 'Official NCERT textbook chapter explaining closure, commutativity, associativity, distributive properties of multiplication, and representation on number line.',
    desc: 'Official NCERT textbook chapter on Rational Numbers for Class 8.',
    class: 'Class 8',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Rational Numbers',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'ncert_class8_maths_ch1.pdf',
    size: '950 KB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/hemh101.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 820,
    viewCount: 2600,
    tags: ['NCERT Official', 'Class 8', 'Mathematics', 'Rational Numbers', 'Textbook'],
    seoTitle: 'NCERT Class 8 Maths Chapter 1 Rational Numbers PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 8 Mathematics Chapter 1 Rational Numbers textbook PDF.',
    keywords: ['NCERT Class 8 Maths', 'Rational Numbers Book', 'Class 8 Chapter 1'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Priyanshu Gupta (Founder)',
    createdAt: '2026-06-17T09:30:00Z',
    updatedAt: '2026-07-01T11:00:00Z',
    date: '2026-06-17'
  },
  {
    id: 'mat18',
    materialId: 'mat18',
    title: 'NCERT Class 7 Science Chapter 1: Nutrition in Plants (Official Book)',
    slug: 'ncert-class-7-science-chapter-1-nutrition-in-plants',
    description: 'Official NCERT textbook chapter explaining autotrophic & heterotrophic modes of nutrition, photosynthesis process, stomata functions, and saprotrophs.',
    desc: 'Official NCERT textbook chapter on Nutrition in Plants for Class 7.',
    class: 'Class 7',
    subject: 'Science',
    chapter: 'Chapter 1: Nutrition in Plants',
    materialType: 'NOTES',
    category: 'NOTES',
    file: 'ncert_class7_science_ch1.pdf',
    size: '890 KB',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/gesc101.pdf',
    isPublic: true,
    status: 'PUBLISHED',
    downloadCount: 670,
    viewCount: 2150,
    tags: ['NCERT Official', 'Class 7', 'Science', 'Nutrition in Plants', 'Photosynthesis'],
    seoTitle: 'NCERT Class 7 Science Chapter 1 Nutrition in Plants PDF - Sunshine Classes',
    metaDescription: 'Download official NCERT Class 7 Science Chapter 1 Nutrition in Plants textbook PDF.',
    keywords: ['NCERT Class 7 Science', 'Nutrition in Plants Book', 'Class 7 Science Chapter 1'],
    createdBy: 'NCERT / Sunshine Classes',
    uploadedBy: 'Rajeev Kr. Verma (Co-Founder)',
    createdAt: '2026-06-18T10:00:00Z',
    updatedAt: '2026-07-02T12:00:00Z',
    date: '2026-06-18'
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




