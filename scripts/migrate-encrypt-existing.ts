/**
 * One-time migration: encrypt existing plaintext PII fields.
 *
 * Usage:
 *   npx tsx scripts/migrate-encrypt-existing.ts           # dry-run (default)
 *   npx tsx scripts/migrate-encrypt-existing.ts --execute  # actually write
 *
 * Requires ENCRYPTION_KEY and DATABASE_URL in environment.
 * Idempotent: skips rows where IV is already populated.
 */

import { PrismaClient } from '@prisma/client';
import { encryptForDb } from '../apps/web/app/_lib/encryption';

const dryRun = !process.argv.includes('--execute');
const prisma = new PrismaClient();

async function migrateContacts() {
  const contacts = await prisma.emergencyContact.findMany({
    where: { phoneIV: null },
  });

  console.log(`EmergencyContact: ${contacts.length} rows to migrate`);

  for (const contact of contacts) {
    const phoneEnc = encryptForDb(contact.phone);
    const emailEnc = contact.email ? encryptForDb(contact.email) : null;

    if (dryRun) {
      console.log(`  [dry-run] Would encrypt contact ${contact.id}: phone=${contact.phone.slice(0, 4)}***, email=${contact.email ? contact.email.slice(0, 4) + '***' : 'null'}`);
    } else {
      await prisma.emergencyContact.update({
        where: { id: contact.id },
        data: {
          phone: phoneEnc.encrypted,
          phoneIV: phoneEnc.iv,
          email: emailEnc?.encrypted ?? contact.email,
          emailIV: emailEnc?.iv ?? null,
        },
      });
      console.log(`  Encrypted contact ${contact.id}`);
    }
  }
}

async function migratePointsAccounts() {
  const accounts = await prisma.pointsAccount.findMany({
    where: {
      accountNumber: { not: null },
      accountNumberIV: null,
    },
  });

  console.log(`PointsAccount: ${accounts.length} rows to migrate`);

  for (const account of accounts) {
    if (!account.accountNumber) continue;

    const enc = encryptForDb(account.accountNumber);
    const last4 = account.accountNumber.slice(-4);

    if (dryRun) {
      console.log(`  [dry-run] Would encrypt account ${account.id}: accountNumber=****${last4}`);
    } else {
      await prisma.pointsAccount.update({
        where: { id: account.id },
        data: {
          accountNumber: enc.encrypted,
          accountNumberIV: enc.iv,
          accountNumberLast4: last4,
        },
      });
      console.log(`  Encrypted account ${account.id}`);
    }
  }
}

async function main() {
  console.log(`Mode: ${dryRun ? 'DRY RUN (pass --execute to write)' : 'EXECUTING'}`);
  console.log('---');

  await migrateContacts();
  await migratePointsAccounts();

  console.log('---');
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
