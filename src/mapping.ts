import { log, Address } from "@graphprotocol/graph-ts"
import {
  Orgid as OrgidContract,
  DirectorshipAccepted,
  DirectorshipTransferred,
  OrgJsonChanged,
  OrganizationActiveStateChanged,
  OrganizationCreated,
  OrganizationOwnershipTransferred,
  UnitCreated,
} from "../generated/Contract/Orgid"
import { Organization } from "../generated/schema"

// Create variable to access ORGiD Contract
const ORGID_ADDRESS = "0x6434DEC2f4548C2aA9D88E8Ff821f387be3D7F0D"
let orgidContract = OrgidContract.bind(Address.fromString(ORGID_ADDRESS))

// Handle the creation of a new organization
export function handleOrganizationCreated(event: OrganizationCreated): void {
  // Create organization with event data
  let organization = new Organization(event.params.orgId.toHex())
  organization.owner = event.params.owner

  // Retrieve additional details from smartcontract
  let callResult = orgidContract.try_getOrganization(event.params.orgId)
  if (callResult.reverted) {
    log.info("getOrganization reverted", [])
  } else {
    organization.isActive = callResult.value.value9
  }

  // Save the organization
  organization.save()
}


export function handleUnitCreated(event: UnitCreated): void {}
export function handleOrganizationActiveStateChanged(event: OrganizationActiveStateChanged): void {}
export function handleOrgJsonChanged(event: OrgJsonChanged): void {}
export function handleOrganizationOwnershipTransferred(event: OrganizationOwnershipTransferred): void {}
export function handleDirectorshipAccepted(event: DirectorshipAccepted): void {}
export function handleDirectorshipTransferred(event: DirectorshipTransferred): void {}
