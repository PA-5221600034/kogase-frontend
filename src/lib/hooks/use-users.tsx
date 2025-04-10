"use client";

import { useState } from 'react';
import { usersApi } from '@/lib/api';
import { 
  GetUsersResponse,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse
} from '@/lib/dtos';

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getUsers = async (): Promise<GetUsersResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUsers();
      return response;
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (userId: string): Promise<GetUserResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUser(userId);
      return response;
    } catch (err) {
      console.error(`Failed to fetch user ${userId}:`, err);
      setError(`Failed to fetch user ${userId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (createUserRequest: CreateUserRequest): Promise<CreateUserResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.createUser(createUserRequest);
      return response;
    } catch (err) {
      console.error('Failed to create user:', err);
      setError('Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updateUserRequest: UpdateUserRequest): Promise<UpdateUserResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.updateUser(userId, updateUserRequest);
      return response;
    } catch (err) {
      console.error(`Failed to update user ${userId}:`, err);
      setError(`Failed to update user ${userId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.deleteUser(userId);
      return response;
    } catch (err) {
      console.error(`Failed to delete user ${userId}:`, err);
      setError(`Failed to delete user ${userId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
  };
} 