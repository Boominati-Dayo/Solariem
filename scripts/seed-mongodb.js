// MongoDB seeding script
import { connectToDatabase } from '../src/lib/mongodb.js';

async function seedPlans() {
  const { db } = await connectToDatabase();
  
  const defaultPlans = [
    {
      name: 'Probation',
      minAmount: 200,
      maxAmount: 999,
      duration: '10 Days',
      roi: 1.5,
      capitalBack: false,
      color: 'blue',
      icon: 'zap',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    },
    {
      name: 'Silver',
      minAmount: 1000,
      maxAmount: 4999,
      duration: '20 Days',
      roi: 2.5,
      capitalBack: true,
      color: 'green',
      icon: 'star',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    },
    {
      name: 'Gold',
      minAmount: 5000,
      maxAmount: 9999,
      duration: '30 Days',
      roi: 4.5,
      capitalBack: true,
      color: 'gold',
      icon: 'crown',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    },
    {
      name: 'Platinum',
      minAmount: 300000,
      maxAmount: 999999,
      duration: '30 Days',
      roi: 6.66,
      capitalBack: true,
      color: 'purple',
      icon: 'gem',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    }
  ];

  const paymentMethods = [
    {
      name: 'Ethereum',
      currency: 'ETH',
      address: '0xd624DB06741B512059b6a8Cd0bbc3800A9Ecf083',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    },
    {
      name: 'Bitcoin',
      currency: 'BTC',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    },
    {
      name: 'Trust Wallet',
      currency: 'USDT',
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      trustWalletLink: 'https://link.trustwallet.com/send?address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&asset=usdt',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    }
  ];

  try {
    await db.collection('investmentPlans').insertMany(defaultPlans);
    console.log('✅ Investment plans seeded successfully');
    
    await db.collection('paymentMethods').insertMany(paymentMethods);
    console.log('✅ Payment methods seeded successfully');

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seed function
seedPlans().catch(console.error);











