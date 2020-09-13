import { 
  Address,
  Bytes,
  log
} from "@graphprotocol/graph-ts"

import {
  ADDRESS_ZERO,
  ORGID_ADDRESS
} from "./constants"

import {
  Orgid as OrgidContract,
} from "../generated/Contract/Orgid"

import { Organization } from "../generated/schema"

// ORGiD Contract
export let orgidContract = OrgidContract.bind(Address.fromString(ORGID_ADDRESS))

// Get organization from contract
export function getOrganizationFromContract(id: Bytes): Organization | null {

  // Create organization
  let organization = new Organization(id.toHex())

  // Retrieve additional details from smartcontract
  let callResult = orgidContract.try_getOrganization(id)

  // Check if the call reverted
  if(callResult.reverted) {
    log.warning("getOrganization reverted", [])
    return null
  }

  // Retrieve values from contract
  let exists                 = callResult.value.value0
  let orgId                  = callResult.value.value1
  let orgJsonHash            = callResult.value.value2
  let orgJsonUri             = callResult.value.value3
  let orgJsonUriBackup1      = callResult.value.value4
  let orgJsonUriBackup2      = callResult.value.value5
  let parentOrgId            = callResult.value.value6
  let owner                  = callResult.value.value7
  let director               = callResult.value.value8
  let isActive               = callResult.value.value9
  let isDirectorshipAccepted = callResult.value.value10

  // Check if the organization exists
  if(!exists) {
    log.warning("Organization deos not exist", [])
    return null
  }

  // Map values which have a 1:1 relationship
  organization.isActive = isActive
  organization.owner = owner

  // Map Director
  if(isDirectorshipAccepted && director.toHexString() != ADDRESS_ZERO) {
    organization.director = director
  }

  return organization
}