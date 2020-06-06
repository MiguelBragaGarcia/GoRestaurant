import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get<IFoodPlate[]>('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      try {
        const response = await api.post<IFoodPlate>('/foods', {
          ...food,
          available: true,
        });

        const newfood = response.data;

        setFoods([...foods, newfood]);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      const response = await api.put<IFoodPlate>(`/foods/${editingFood.id}`, {
        id: editingFood.id,
        ...food,
        available: editingFood.available,
      });
      const updatedFood = response.data;

      const foodsArray = foods.filter(teste => teste.id !== editingFood.id);
      setFoods([...foodsArray, updatedFood]);
    },
    [editingFood.id, editingFood.available, foods],
  );

  const handleDeleteFood = useCallback(
    async (id: number) => {
      await api.delete(`/foods/${id}`);

      setFoods(foods.filter(food => food.id !== id));
    },
    [foods],
  );

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [setModalOpen, modalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen, setEditModalOpen]);

  const handleEditFood = useCallback(
    (food: IFoodPlate) => {
      setEditingFood(food);
      toggleEditModal();
    },
    [toggleEditModal],
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
