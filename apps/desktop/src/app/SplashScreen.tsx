import { motion } from 'framer-motion';
import { Logo } from '@angkorgit/design-system';
import { useSettings } from '@/features/settings/store';

export function SplashScreen() {
  const reduceMotion = useSettings((s) => s.reduceMotion);
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.2, ease: 'easeInOut' } }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-foreground"
      >
        <Logo size={96} animated={!reduceMotion} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.2 }}
        className="text-center"
      >
        <h1 className="font-sans text-3xl font-black tracking-tight text-foreground">AngKorGit</h1>
        <p className="mt-2 text-xs text-muted">Strength. Simplicity. Craftsmanship.</p>
      </motion.div>
    </motion.div>
  );
}
