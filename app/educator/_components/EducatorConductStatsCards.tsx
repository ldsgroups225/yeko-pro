// app/educator/_components/EducatorConductStatsCards.tsx

'use client'

import type { IConductStats } from '@/types'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Award, BarChart3, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getConductGradeLabel } from '../types'

interface EducatorConductStatsCardsProps {
  stats: IConductStats
}

export function EducatorConductStatsCards({ stats }: EducatorConductStatsCardsProps) {
  const {
    totalStudents,
    averageScore,
    excellenceRate,
    gradeDistribution,
    recentIncidents,
    improvementTrend,
  } = stats

  const getGradePercentage = (count: number) => {
    return totalStudents > 0 ? (count / totalStudents) * 100 : 0
  }

  const isImproving = improvementTrend >= 0

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  <Users className="h-3 w-3" />
                  Population
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Élèves inscrits</p>
                </div>
              </div>
              <div className="rounded-2xl bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score Card */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  <BarChart3 className="h-3 w-3" />
                  Performance
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {averageScore.toFixed(1)}
                    <span className="text-lg text-muted-foreground">/20</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isImproving
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                    >
                      {isImproving
                        ? (
                            <ArrowUpRight className="h-3 w-3" />
                          )
                        : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                      {Math.abs(improvementTrend).toFixed(1)}
                      %
                    </div>
                    <span className="text-xs text-muted-foreground">vs mois dernier</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents Card */}
        <Card className={`group relative overflow-hidden border-0 hover:shadow-lg transition-all duration-300 ${
          recentIncidents > 0
            ? 'bg-gradient-to-br from-orange-50 to-orange-100/50'
            : 'bg-gradient-to-br from-slate-50 to-slate-100/50'
        }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br to-transparent ${
            recentIncidents > 0 ? 'from-orange-500/5' : 'from-slate-500/5'
          }`}
          />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  recentIncidents > 0
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Incidents
                </div>
                <div>
                  <p className="text-3xl font-bold">{recentIncidents}</p>
                  <p className="text-sm text-muted-foreground">Ce trimestre</p>
                </div>
              </div>
              <div className={`rounded-2xl p-3 transition-colors ${
                recentIncidents > 0
                  ? 'bg-orange-500/10 group-hover:bg-orange-500/20'
                  : 'bg-slate-500/10 group-hover:bg-slate-500/20'
              }`}
              >
                <AlertTriangle className={`h-6 w-6 ${
                  recentIncidents > 0 ? 'text-orange-600' : 'text-slate-600'
                }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Excellence Rate Card */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                  <Award className="h-3 w-3" />
                  Excellence
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {excellenceRate.toFixed(0)}
                    <span className="text-lg text-muted-foreground">%</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Bonne + Très bonne</p>
                </div>
              </div>
              <div className="rounded-2xl bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution Chart - Redesigned with Design System */}
      <Card className="group relative overflow-hidden border border-border/30 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm hover:shadow-lg transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/5" />
        <CardContent className="relative p-8">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Répartition des Notes de Conduite</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Distribution des appréciations pour
                  {' '}
                  {totalStudents}
                  {' '}
                  élèves
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Élèves</div>
              </div>
            </div>

            {/* Grade Distribution Grid - Compact 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(gradeDistribution)
                .sort(([a], [b]) => {
                  const order = { TRES_BONNE: 0, BONNE: 1, PASSABLE: 2, MAUVAISE: 3, BLAME: 4 }
                  return (order[a as keyof typeof order] || 5) - (order[b as keyof typeof order] || 5)
                })
                .map(([grade, count]) => {
                  const percentage = getGradePercentage(count)
                  const gradeKey = grade as keyof typeof gradeDistribution
                  const label = getConductGradeLabel(gradeKey)

                  // Using your design system colors with semantic meaning
                  const getGradeSystemStyle = (grade: string) => {
                    switch (grade) {
                      case 'TRES_BONNE':
                        return {
                          containerBg: 'bg-gradient-to-r from-primary/10 to-chart-1/10 hover:from-primary/15 hover:to-chart-1/15',
                          progressBg: 'bg-gradient-to-r from-primary to-chart-1',
                          badge: 'bg-primary/10 text-primary border-primary/20',
                          dot: 'bg-primary shadow-primary/25',
                          icon: '🏆',
                          scoreRange: '18-20',
                        }
                      case 'BONNE':
                        return {
                          containerBg: 'bg-gradient-to-r from-chart-2/10 to-chart-3/10 hover:from-chart-2/15 hover:to-chart-3/15',
                          progressBg: 'bg-gradient-to-r from-[hsl(var(--chart-2))] to-[hsl(var(--chart-3))]',
                          badge: 'bg-chart-2/10 text-[hsl(var(--chart-2))] border-chart-2/20',
                          dot: 'bg-[hsl(var(--chart-2))] shadow-chart-2/25',
                          icon: '⭐',
                          scoreRange: '14-17',
                        }
                      case 'PASSABLE':
                        return {
                          containerBg: 'bg-gradient-to-r from-chart-4/10 to-chart-5/10 hover:from-chart-4/15 hover:to-chart-5/15',
                          progressBg: 'bg-gradient-to-r from-[hsl(var(--chart-4))] to-[hsl(var(--chart-5))]',
                          badge: 'bg-chart-4/10 text-[hsl(var(--chart-4))] border-chart-4/20',
                          dot: 'bg-[hsl(var(--chart-4))] shadow-chart-4/25',
                          icon: '📊',
                          scoreRange: '10-13',
                        }
                      case 'MAUVAISE':
                        return {
                          containerBg: 'bg-gradient-to-r from-destructive/10 to-destructive/15 hover:from-destructive/15 hover:to-destructive/20',
                          progressBg: 'bg-gradient-to-r from-destructive to-destructive',
                          badge: 'bg-destructive/10 text-destructive border-destructive/20',
                          dot: 'bg-destructive shadow-destructive/25',
                          icon: '⚠️',
                          scoreRange: '6-9',
                        }
                      case 'BLAME':
                        return {
                          containerBg: 'bg-gradient-to-r from-destructive/15 to-destructive/20 hover:from-destructive/20 hover:to-destructive/25',
                          progressBg: 'bg-gradient-to-r from-destructive via-destructive to-destructive',
                          badge: 'bg-destructive/15 text-destructive border-destructive/25',
                          dot: 'bg-destructive shadow-destructive/30',
                          icon: '🚨',
                          scoreRange: '0-5',
                        }
                      default:
                        return {
                          containerBg: 'bg-gradient-to-r from-muted/50 to-muted/70',
                          progressBg: 'bg-muted-foreground',
                          badge: 'bg-muted text-muted-foreground border-border',
                          dot: 'bg-muted-foreground',
                          icon: '❓',
                          scoreRange: '--',
                        }
                    }
                  }

                  const styles = getGradeSystemStyle(grade)

                  return (
                    <div
                      key={grade}
                      className={`group/item relative p-4 rounded-lg border border-border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${styles.containerBg}`}
                    >
                      {/* Compact Grade Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${styles.dot} shadow-sm`} />
                            <div className="absolute -top-0.5 -right-0.5 text-xs">{styles.icon}</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${styles.badge}`}>
                              {label}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {styles.scoreRange}
                              /20
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <div className="text-xl font-bold text-foreground group-hover/item:scale-105 transition-transform duration-300">
                            {count}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>

                      {/* Compact Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full ${styles.progressBg} transition-all duration-700 ease-out shadow-sm relative overflow-hidden`}
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                          >
                            {/* Subtle Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse" />
                          </div>
                        </div>

                        {/* Count Label for Larger Percentages */}
                        {percentage > 20 && (
                          <div
                            className="absolute inset-y-0 left-0 flex items-center px-2"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs font-semibold text-white/90 drop-shadow-sm">
                              {count}
                            </span>
                          </div>
                        )}

                        {/* External Count for Small Percentages */}
                        {percentage <= 20 && count > 0 && (
                          <div className="absolute right-0 top-0 -mt-5">
                            <span className="text-xs font-medium text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded shadow-sm border border-border">
                              {count}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-none z-10">
                        <div className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {label}
                          :
                          {count}
                          /
                          {totalStudents}
                          {' '}
                          (
                          {percentage.toFixed(1)}
                          %)
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-foreground" />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Summary Footer */}
            <div className="pt-6 border-t border-border">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {(gradeDistribution.TRES_BONNE + gradeDistribution.BONNE)}
                  </div>
                  <div className="text-xs text-muted-foreground">Excellence</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {gradeDistribution.PASSABLE}
                  </div>
                  <div className="text-xs text-muted-foreground">Acceptable</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {gradeDistribution.MAUVAISE}
                  </div>
                  <div className="text-xs text-muted-foreground">À améliorer</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {gradeDistribution.BLAME}
                  </div>
                  <div className="text-xs text-muted-foreground">Critique</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
