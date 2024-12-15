import type { Infer } from 'convex/values'
import type { TeamId } from '../types'
import type { MutationCtx, QueryCtx } from './types'
import { v } from 'convex/values'

export const vPermission = v.union(
  v.literal('Manage Team'),
  v.literal('Delete Team'),
  v.literal('Read Members'),
  v.literal('Manage Members'),
  v.literal('Contribute'),
)
export type Permission = Infer<typeof vPermission>

export const vRole = v.union(v.literal('Parent'), v.literal('Teacher'), v.literal('Director'), v.literal('Admin'))
export type Role = Infer<typeof vRole>

export async function getPermission(ctx: QueryCtx, name: Permission) {
  return (await ctx.table('permissions').getX('name', name))._id
}

export async function getRole(ctx: QueryCtx, name: Role) {
  return await ctx.table('roles').getX('name', name)
}

export async function viewerWithPermission(
  ctx: QueryCtx,
  teamId: TeamId,
  name: Permission,
) {
  const member = await ctx
    .table('members', 'teamUser', q =>
      q.eq('teamId', teamId).eq('userId', ctx.viewerX()._id))
    .unique()
  if (
    member === null
    || member.deletionTime !== undefined
    || !(await member
      .edge('role')
      .edge('permissions')
      .has(await getPermission(ctx, name)))
  ) {
    return null
  }
  return member
}

export async function viewerHasPermission(
  ctx: QueryCtx,
  teamId: TeamId,
  name: Permission,
) {
  const member = await viewerWithPermission(ctx, teamId, name)
  return member !== null
}

export async function viewerWithPermissionX(
  ctx: MutationCtx,
  teamId: TeamId,
  name: Permission,
) {
  const member = await viewerWithPermission(ctx, teamId, name)
  if (member === null) {
    throw new Error(`Viewer does not have the permission "${name}"`)
  }
  return member
}

export async function viewerHasPermissionX(
  ctx: MutationCtx,
  teamId: TeamId,
  name: Permission,
) {
  await viewerWithPermissionX(ctx, teamId, name)
  return true
}
