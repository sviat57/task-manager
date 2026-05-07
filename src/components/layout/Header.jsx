import { motion } from 'framer-motion';
import { VIEWS } from '../../constants';

const titles = {
  [VIEWS.LIST]:   { title: 'Мои задачи',    sub: 'Управляйте задачами эффективно' },
  [VIEWS.KANBAN]: { title: 'Канбан-доска',  sub: 'Визуализируйте рабочий процесс' },
  [VIEWS.STATS]:  { title: 'Статистика',    sub: 'Анализируйте свою продуктивность' },
};

export function Header({ view }) {
  const { title, sub } = titles[view] || titles[VIEWS.LIST];
  return (
    <motion.div
      key={view}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
    </motion.div>
  );
}