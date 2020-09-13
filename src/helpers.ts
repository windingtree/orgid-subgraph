import { 
  Address,
  Bytes,
  log,
} from "@graphprotocol/graph-ts"

import {
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

  // Lazy-load organization
  let organization = Organization.load(id.toHex())
  if(organization == null) {
    organization = new Organization(id.toHex())
  }

  // Retrieve additional details from smartcontract
  let getOrganizationCallResult = orgidContract.try_getOrganization(id)

  // Check if the call reverted
  if(getOrganizationCallResult.reverted) {
    log.warning("getOrganization reverted", [])
    return null
  }

  // Retrieve values from contract
  let exists                 = getOrganizationCallResult.value.value0
  let orgId                  = getOrganizationCallResult.value.value1
  let orgJsonHash            = getOrganizationCallResult.value.value2
  let orgJsonUri             = getOrganizationCallResult.value.value3
  let orgJsonUriBackup1      = getOrganizationCallResult.value.value4
  let orgJsonUriBackup2      = getOrganizationCallResult.value.value5
  let parentOrgId            = getOrganizationCallResult.value.value6
  let owner                  = getOrganizationCallResult.value.value7
  let director               = getOrganizationCallResult.value.value8
  let isActive               = getOrganizationCallResult.value.value9
  let isDirectorshipAccepted = getOrganizationCallResult.value.value10

  // Check if the organization exists
  if(!exists) {
    log.warning("Organization deos not exist", [])
    return null
  }

  // Map values which have a 1:1 relationship
  organization.isActive = isActive
  organization.owner = owner

  // Map Director
  if(isDirectorshipAccepted && director != null) {
    organization.director = director
  }

  // Map Parent
  if(parentOrgId != null) {
    organization.parent = parentOrgId.toHexString()
  }

  // Map units
  let getUnitsCallResult = orgidContract.try_getUnits(id, true)
  if(!getUnitsCallResult.reverted) {
    let rawUnits = <Array<Bytes>>getUnitsCallResult.value
    organization.units = rawUnits.map<string>((value: Bytes, index: i32, array: Array<Bytes>) => value.toHexString())
  }

  return organization
}