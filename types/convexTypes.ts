import type { DataModel, Id } from '../convex/_generated/dataModel'

export type IGrade = DataModel['grades']['document']
export type ISchool = DataModel['schools']['document']
export type IClass = DataModel['classes']['document']

export type GradeId = Id<'grades'>
export type SchoolId = Id<'schools'>
export type ClassId = Id<'classes'>
export type MemberId = Id<'members'>
export type TeamId = Id<'teams'>
export type RoleId = Id<'roles'>
export type PermissionId = Id<'permissions'>
export type MessageId = Id<'messages'>
export type InviteId = Id<'invites'>
export type SchoolYearId = Id<'schoolYears'>
export type CycleId = Id<'cycles'>
export type StateId = Id<'states'>
export type UserId = Id<'users'>
