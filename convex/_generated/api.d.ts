/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as classes from "../classes.js";
import type * as functions from "../functions.js";
import type * as init from "../init.js";
import type * as invites from "../invites.js";
import type * as permissions from "../permissions.js";
import type * as schools from "../schools.js";
import type * as types from "../types.js";
import type * as users_teams_members from "../users/teams/members.js";
import type * as users_teams_messages from "../users/teams/messages.js";
import type * as users_teams_roles from "../users/teams/roles.js";
import type * as users_teams from "../users/teams.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  classes: typeof classes;
  functions: typeof functions;
  init: typeof init;
  invites: typeof invites;
  permissions: typeof permissions;
  schools: typeof schools;
  types: typeof types;
  "users/teams/members": typeof users_teams_members;
  "users/teams/messages": typeof users_teams_messages;
  "users/teams/roles": typeof users_teams_roles;
  "users/teams": typeof users_teams;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
