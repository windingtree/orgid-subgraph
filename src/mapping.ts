import { log } from "@graphprotocol/graph-ts"
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
  getOrganizationFromContract
} from './helpers'


// Handle the creation of a new organization
export function handleOrganizationCreated(event: OrganizationCreated): void {
  // Create organization with event data
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    organization.save()
  }
}


export function handleUnitCreated(event: UnitCreated): void {}
export function handleOrganizationActiveStateChanged(event: OrganizationActiveStateChanged): void {}
export function handleOrgJsonChanged(event: OrgJsonChanged): void {}
export function handleOrganizationOwnershipTransferred(event: OrganizationOwnershipTransferred): void {}
export function handleDirectorshipAccepted(event: DirectorshipAccepted): void {}
export function handleDirectorshipTransferred(event: DirectorshipTransferred): void {}
