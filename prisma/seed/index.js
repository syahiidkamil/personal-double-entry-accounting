const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')
  
  try {
    // Check if admin user already exists
    const adminExists = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    })
    
    if (!adminExists) {
      // Create admin user if it doesn't exist
      console.log('Creating admin user...')
      
      const admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          password_hash: await bcrypt.hash('adminpassword', 10),
          role: 'ADMIN',
          preferences: {
            mainCurrency: "IDR",
            currencies: ["IDR", "USD"]
          }
        }
      })
      
      console.log(`Admin user created with ID: ${admin.id}`)
    } else {
      console.log('Admin user already exists, skipping creation')
    }
    
    // Check if a regular user already exists
    const userExists = await prisma.user.findFirst({
      where: {
        email: 'user@example.com',
        role: 'REGULAR'
      }
    })
    
    if (!userExists) {
      // Create regular test user if it doesn't exist
      console.log('Creating regular test user...')
      
      const user = await prisma.user.create({
        data: {
          name: 'Regular User',
          email: 'user@example.com',
          password_hash: await bcrypt.hash('userpassword', 10),
          role: 'REGULAR',
          preferences: {
            mainCurrency: "IDR",
            currencies: ["IDR"]
          }
        }
      })
      
      console.log(`Regular user created with ID: ${user.id}`)
    } else {
      console.log('Regular test user already exists, skipping creation')
    }
    
    console.log('Database seeding completed successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })