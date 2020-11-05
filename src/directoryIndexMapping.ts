import {
  SegmentAdded,
  SegmentRemoved,
} from '../generated/DirectoryIndex/DirectoryIndex'

import { Segment } from '../generated/schema'
import { Address } from "@graphprotocol/graph-ts"

function safeGetSegment(segmentAddress: Address): Segment {
  let segment = Segment.load(segmentAddress.toHexString())
  if(!segment) {
    segment = new Segment(segmentAddress.toHexString())
  }
  return segment
}

// Handle the addition of a new segment
export function handleSegmentAdded(event: SegmentAdded): void {
  let segment = safeGetSegment(event.params.segment)
  segment.isRemoved = false
  segment.addedAtTimestamp = event.block.timestamp
  segment.addedAtBlockNumber = event.block.number
  segment.save()
}

// Handle the removal of a segment
export function handleSegmentRemoved(event: SegmentRemoved): void {
  let segment = safeGetSegment(event.params.segment)
  segment.isRemoved = true
  segment.removedAtTimestamp = event.block.timestamp
  segment.removedAtBlockNumber = event.block.number
  segment.save()
}
