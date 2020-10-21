import {
  DirectorshipAccepted,
  DirectorshipTransferred,
  OrgJsonChanged,
  OrganizationActiveStateChanged,
  OrganizationCreated,
  OrganizationOwnershipTransferred,
  UnitCreated,
} from "../generated/Contract/Orgid"

import { 
  getOrganizationFromContract,
} from './orgid'

import { enrich } from './ipfs'
import { Organization } from "../generated/schema"

// Handle the creation of a new organization
export function handleOrganizationCreated(event: OrganizationCreated): void {
  // Create organization with event data
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    // Update creation time
    organization.createdAtTimestamp = event.block.timestamp
    organization.createdAtBlockNumber = event.block.number

    // Save organization
    organization.save()
    enrich(<Organization>organization)
  }
}

// Handle the creation of a new unit
export function handleUnitCreated(event: UnitCreated): void {
  let unit = getOrganizationFromContract(event.params.unitOrgId)
  if(unit) {
    // Update creation time
    unit.createdAtTimestamp = event.block.timestamp
    unit.createdAtBlockNumber = event.block.number

    // Save organization
    unit.save()
  }
}

export function handleOrgJsonChanged(event: OrgJsonChanged): void {}

// Handle the change of status of an organization
export function handleOrganizationActiveStateChanged(event: OrganizationActiveStateChanged): void {
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    organization.isActive = event.params.newState
    organization.save()
  }
}

// Handle the change of ownership
export function handleOrganizationOwnershipTransferred(event: OrganizationOwnershipTransferred): void {
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    organization.owner = event.params.newOwner
    organization.save()
  }
}

// Handle the acceptance of directorship
export function handleDirectorshipAccepted(event: DirectorshipAccepted): void {
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    organization.director = event.params.director
    organization.save()
  }
}

// Handle the transfer of directorship
export function handleDirectorshipTransferred(event: DirectorshipTransferred): void {
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    organization.director = event.params.newDirector
    organization.save()
  }
}
