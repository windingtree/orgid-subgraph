import {
  DirectorshipAccepted,
  DirectorshipTransferred,
  OrgJsonChanged,
  OrganizationActiveStateChanged,
  OrganizationCreated,
  OrganizationOwnershipTransferred,
  UnitCreated,
} from '../generated/Contract/Orgid'
import { Bytes, log } from "@graphprotocol/graph-ts"
import { getOrganizationFromContract } from './orgid'
import { cidFromHash, getLegalEntity, getOrganizationalUnit } from './ipfs'

// Handle the creation of a new organization
export function handleOrganizationCreated(event: OrganizationCreated): void {
  // Create organization with event data
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {
    // Update creation time
    organization.createdAtTimestamp = event.block.timestamp
    organization.createdAtBlockNumber = event.block.number
    organization.organizationType = "LegalEntity"

    // Add JSON IPFS CID
    if(organization.orgJsonHash) {
      organization.ipfsCid = cidFromHash(organization.orgJsonHash as Bytes)

      // Add LegalEntity
      let legalEntity = getLegalEntity(organization.ipfsCid)
      if(legalEntity) {
        legalEntity.organization = organization.id
        legalEntity.save()
        organization.legalEntity = legalEntity.id
      }
    }

    // Save organization
    organization.save()
    
  }
}

// Handle the creation of a new unit
export function handleUnitCreated(event: UnitCreated): void {
  let unit = getOrganizationFromContract(event.params.unitOrgId)
  if(unit) {
    // Update creation time
    unit.createdAtTimestamp = event.block.timestamp
    unit.createdAtBlockNumber = event.block.number
    unit.organizationType = "OrganizationalUnit"

    // Add JSON IPFS CID
    if(unit.orgJsonHash) {
      unit.ipfsCid = cidFromHash(unit.orgJsonHash as Bytes)

      // Add OrganizationalUnit
      let organizationalUnit = getOrganizationalUnit(unit.ipfsCid)
      if(organizationalUnit) {
        organizationalUnit.save()
        unit.organizationalUnit = organizationalUnit.id
      }
    }

    // Save organization
    unit.save()
  }
}

export function handleOrgJsonChanged(event: OrgJsonChanged): void {
  // Retrieve the organization
  let organization = getOrganizationFromContract(event.params.orgId)
  if(organization) {

    // Update Hash and CID
    organization.orgJsonHash = event.params.newOrgJsonHash
    organization.ipfsCid = cidFromHash( event.params.newOrgJsonHash)

    // Update the entity object
    if(organization.organizationType == 'LegalEntity') {
      // Case of the LegalEntity
      let legalEntity = getLegalEntity(organization.ipfsCid)
      if(legalEntity) {
        legalEntity.organization = organization.id
        legalEntity.save()
        organization.legalEntity = legalEntity.id
      }
    }

      // Case of the LegalEntity
    else if(organization.organizationType == 'OrganizationalUnit') {
      let organizationalUnit = getOrganizationalUnit(organization.ipfsCid)
      if(organizationalUnit) {
        organizationalUnit.organization = organization.id
        organizationalUnit.save()
        organization.organizationalUnit = organizationalUnit.id
      }
    }

    // Unknown organization type
    else  {
      log.warning("Mapping|{}|{}|Unexpected organization type", [event.params.orgId.toHexString(), organization.organizationType])
    }

    organization.save()
  }
}

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
