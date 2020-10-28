import { 
  json,
  JSONValue,
  JSONValueKind,
  log,
  TypedMap
} from "@graphprotocol/graph-ts"
  
import { getJson } from "./ipfs"
import { LegalEntity, OrganizationalUnit, OrganizationAddress, Organization } from "../generated/schema"

// Get safely a property of an object
function safeGet(jsonObject: TypedMap<string, JSONValue> | null, expectedKind: JSONValueKind, property: string): JSONValue | null {
  if(jsonObject == null) {
    return null
  }
  
  // Check presence
  if(!jsonObject.isSet(property)) {
    log.error('OrgJSON|{}|Missing property', [property])
    return null
  }

  // Get the property value
  let value = jsonObject.get(property)
  if(value.kind != expectedKind) {
    log.error('OrgJSON|{}|Unexpected kind', [property])
    return null
  }

  return value
}

// Get a propeperty as string
function getStringProperty(jsonObject: TypedMap<string, JSONValue> | null, property: string): string | null {
  let value = safeGet(jsonObject, JSONValueKind.STRING, property)
  return value != null ? value.toString() : null
}

// Get a propeperty as object
function getObjectProperty(jsonObject: TypedMap<string, JSONValue> | null, property: string): TypedMap<string, JSONValue> | null {
  let value = safeGet(jsonObject, JSONValueKind.OBJECT, property)
  return value != null ? value.toObject() : null
}

// Get a propperty as array
function getArrayProperty(jsonObject: TypedMap<string, JSONValue> | null, property: string): Array<JSONValue> | null {
  let value = safeGet(jsonObject, JSONValueKind.ARRAY, property)
  return value != null ? value.toArray() : null
}

// Convert a JSON Value to an Address
function toAddress(did: string, jsonObject: TypedMap<string, JSONValue> | null): OrganizationAddress | null {
  if(jsonObject == null) {
    return null
  }
  
  let outputAddress = OrganizationAddress.load(did)
  if(!outputAddress) {
    outputAddress = new OrganizationAddress(did)
  }

  outputAddress.country = getStringProperty(jsonObject, 'country')
  outputAddress.subdivision = getStringProperty(jsonObject, 'subdivision')
  outputAddress.locality = getStringProperty(jsonObject, 'locality')
  outputAddress.streetAddress = getStringProperty(jsonObject, 'streetAddress')
  outputAddress.postalCode = getStringProperty(jsonObject, 'postalCode')

  return outputAddress

}

// Convert a JSON Value to legal entity
function toLegalEntity(jsonValue: JSONValue): LegalEntity | null {
  // Convert to object
  let jsonObject = jsonValue.toObject()
      
  // Process DID
  let did = getStringProperty(jsonObject, 'id')
  if(!did) {
    log.error('orgJson|{}|Missing did', [])
    return null
  }

  let outputLegalEntity = LegalEntity.load(did)
  if(!outputLegalEntity) {
    outputLegalEntity = new LegalEntity(did)
  }
  
  // Handle Legal Entity
  let legalEntityObject = getObjectProperty(jsonObject, 'legalEntity')
  if(!legalEntityObject) {
    log.error('orgJson|{}|Missing legalEntityValue', [did])
    return null
  }
  
  // Handle legal name presence
  outputLegalEntity.legalName = getStringProperty(legalEntityObject, 'legalName')
  outputLegalEntity.legalType = getStringProperty(legalEntityObject, 'legalType')
  outputLegalEntity.legalIdentifier = getStringProperty(legalEntityObject, 'legalIdentifier')
  
  // Handle the address
  let addressObject = getObjectProperty(legalEntityObject, 'registeredAddress')
  if(addressObject) {
    let address = toAddress(did, addressObject)
    if(address) {
      address.save()
      outputLegalEntity.registeredAddress = address.id
    }
  }

  return outputLegalEntity
}

// Convert a JSON Value to an organizational unit
function toOrganizationalUnit(jsonValue: JSONValue): OrganizationalUnit | null {
  // Convert to object
  let jsonObject = jsonValue.toObject()
      
  // Process DID
  let did = getStringProperty(jsonObject, 'id')
  if(!did) {
    log.error('orgJson|{}|Missing did', [])
    return null
  }

  let outputOrganizationalUnit = OrganizationalUnit.load(did)
  if(!outputOrganizationalUnit) {
    outputOrganizationalUnit = new OrganizationalUnit(did)
  }
  
  // Handle Legal Entity
  let organizationalUnitObject = getObjectProperty(jsonObject, 'organizationalUnit')
  if(!organizationalUnitObject) {
    log.error('orgJson|{}|Missing organizationalUnit', [did])
    return null
  }
  
  // Handle legal name presence
  outputOrganizationalUnit.name = getStringProperty(organizationalUnitObject, 'name')
  let types = getArrayProperty(organizationalUnitObject, 'type')
  if(types != null) {
    outputOrganizationalUnit.type = (types as Array<JSONValue>).map<string>((value: JSONValue) => value.toString())
  }
  outputOrganizationalUnit.description = getStringProperty(organizationalUnitObject, 'description')
  outputOrganizationalUnit.longDescription = getStringProperty(organizationalUnitObject, 'longDescription')

  // Handle the address
  let addressObject = getObjectProperty(organizationalUnitObject, 'address')
  if(addressObject) {
    let address = toAddress(did, addressObject)
    if(address) {
      address.save()
      outputOrganizationalUnit.address = address.id
    }
  }

  return outputOrganizationalUnit
}

// Retrieve Legal Entity from IPFS content
export function getLegalEntity(ipfsCid: string): LegalEntity | null {
  
  // Extract JSON document
  let orgJsonValue = getJson(ipfsCid, JSONValueKind.OBJECT)
  if(!orgJsonValue) {
    log.warning('LegalEntity|{}|Error fetching JSON', [ipfsCid])
    return null
  }

  // Extract legal entity
  let legalEntity = toLegalEntity(orgJsonValue as JSONValue)
  if(!legalEntity) {
    log.warning('LegalEntity|{}|Error parsing JSON', [ipfsCid])
    return null
  }

  return legalEntity

}


// Retrieve Organizational Unit from IPFS content
export function getOrganizationalUnit(ipfsCid: string): OrganizationalUnit | null {
  
  // Extract JSON document
  let orgJsonValue = getJson(ipfsCid, JSONValueKind.OBJECT)
  if(!orgJsonValue) {
    log.warning('OrganizationalUnit|{}|Error fetching JSON', [ipfsCid])
    return null
  }

  // Extract Organizational Unit
  let organizationalUnit = toOrganizationalUnit(orgJsonValue as JSONValue)
  if(!organizationalUnit) {
    log.warning('OrganizationalUnit|{}|Error parsing JSON', [ipfsCid])
    return null
  }

  return organizationalUnit

}