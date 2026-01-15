/**
 * Script para generar un Extended Public Key (xpub) de Dash testnet
 * 
 * USO:
 * node scripts/generate-xpub.js
 * 
 * IMPORTANTE:
 * - Guarda tu seed phrase en un lugar seguro
 * - NUNCA compartas tu seed phrase con nadie
 * - El xpub es seguro para compartir (solo genera direcciones públicas)
 */

const dashcore = require('@dashevo/dashcore-lib');

console.log('🔑 Generador de Dash xpub (testnet)\n');
console.log('━'.repeat(60));

try {
  // Generar mnemonic aleatorio de 12 palabras
  const Mnemonic = dashcore.Mnemonic;
  const mnemonic = new Mnemonic();
  const seedPhrase = mnemonic.toString();
  
  console.log('\n⚠️  IMPORTANTE: Guarda estas palabras en un lugar SEGURO');
  console.log('   Nunca las compartas con nadie. Te permiten recuperar tu wallet.\n');
  console.log('📝 Seed Phrase (12 palabras):');
  console.log('━'.repeat(60));
  console.log(`   ${seedPhrase}`);
  console.log('━'.repeat(60));
  
  // Derivar HD Private Key para testnet
  const HDPrivateKey = dashcore.HDPrivateKey;
  const hdPrivateKey = HDPrivateKey.fromSeed(mnemonic.toSeed(), 'testnet');
  
  // Derivar usando el path estándar de Dash: m/44'/1'/0'
  // 44' = BIP44
  // 1' = Dash testnet (5' sería mainnet)
  // 0' = Account 0
  const derived = hdPrivateKey.deriveChild("m/44'/1'/0'");
  
  // Obtener el xpub (Extended Public Key)
  const xpub = derived.hdPublicKey.toString();
  
  console.log('\n✅ Extended Public Key (xpub) generado:\n');
  console.log('📋 XPUB (testnet):');
  console.log('━'.repeat(60));
  console.log(`   ${xpub}`);
  console.log('━'.repeat(60));
  
  // Generar las primeras 3 direcciones como ejemplo
  console.log('\n📍 Primeras 3 direcciones derivadas (para verificación):\n');
  
  for (let i = 0; i < 3; i++) {
    const childKey = derived.hdPublicKey.deriveChild(`m/0/${i}`);
    const address = childKey.publicKey.toAddress('testnet').toString();
    console.log(`   ${i + 1}. ${address}`);
  }
  
  console.log('\n━'.repeat(60));
  console.log('\n💡 Siguiente paso:');
  console.log('   1. Guarda tu seed phrase en un lugar seguro (papel, USB encriptado)');
  console.log('   2. Copia el xpub de arriba');
  console.log('   3. Ejecuta: node scripts/encrypt-credentials.js');
  console.log('   4. Pega el xpub cuando te lo pida');
  console.log('\n🌐 Para obtener DASH testnet:');
  console.log('   http://testnet-faucet.dash.org/');
  console.log('   Envía a alguna de las direcciones mostradas arriba\n');
  
} catch (error) {
  console.error('\n❌ Error generando xpub:', error.message);
  console.error('\nAsegúrate de tener instalado @dashevo/dashcore-lib:');
  console.error('   npm install @dashevo/dashcore-lib\n');
  process.exit(1);
}
