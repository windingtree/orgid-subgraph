import { log } from "@graphprotocol/graph-ts"
import {
  Orgid,
  DirectorshipAccepted,
  DirectorshipTransferred,
  OrgJsonChanged,
  OrganizationActiveStateChanged,
  OrganizationCreated,
  OrganizationOwnershipTransferred,
  UnitCreated,
} from "../generated/Contract/Orgid"
import { Organization } from "../generated/schema"

// Handle the creation of a new organization
export function handleOrganizationCreated(event: OrganizationCreated): void {
  // Create organization with event data
  let organization = new Organization(event.params.orgId.toHex())
  organization.owner = event.params.owner
  organization.save()

  // Retrieve additional details from smartcontract
  /*
  let callResult = Orgid.try_getOrganization(event.params.orgId)
  if (callResult.reverted) {
    log.info("getOrganization reverted", [])
  } else {
    organization.isActive = callResult.value[8]
  }*/
}


export function handleUnitCreated(event: UnitCreated): void {}
export function handleOrganizationActiveStateChanged(event: OrganizationActiveStateChanged): void {}
export function handleOrgJsonChanged(event: OrgJsonChanged): void {}
export function handleOrganizationOwnershipTransferred(event: OrganizationOwnershipTransferred): void {}
export function handleDirectorshipAccepted(event: DirectorshipAccepted): void {}
export function handleDirectorshipTransferred(event: DirectorshipTransferred): void {}
