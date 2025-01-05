/**
 * @writecarenotes.com
 * @fileoverview Client type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for client-related data structures.
 */

export interface Location {
  lat: number;
  lng: number;
}

export interface Client {
  id: string;
  name: string;
  location: Location;
} 