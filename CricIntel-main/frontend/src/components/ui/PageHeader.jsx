import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

const PageHeader = ({
    title,
    description,
    icon: Icon = null,
    breadcrumbs = [],
    action = null,
    className = ''
}) => {
    return (
        <div className={cn("mb-8", className)}>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <Link to="/app" className="hover:text-primary transition-colors">App</Link>
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRight size={12} className="text-gray-700" />
                            {crumb.path ? (
                                <Link to={crumb.path} className="hover:text-primary transition-colors">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-300">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        {Icon && (
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                <Icon size={20} className="text-primary" />
                            </div>
                        )}
                        <h1 className="text-3xl md:text-4xl font-space font-black text-white">{title}</h1>
                    </div>
                    {description && (
                        <p className="text-sm text-gray-400 max-w-2xl ml-[52px]">
                            {description}
                        </p>
                    )}
                </motion.div>

                {action && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="shrink-0"
                    >
                        {action}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default PageHeader
