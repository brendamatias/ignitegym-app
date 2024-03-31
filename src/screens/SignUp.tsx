import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base";
import { useNavigation } from "@react-navigation/native";

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { useForm, Controller } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useAuth } from "@hooks/useAuth";
import { useState } from "react";

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o e-mail').email('E-mail inválido.'),
  password: yup.string().required('Informe a senha').min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  password_confirm: yup.string().required('Confirme a senha.').oneOf([yup.ref('password')], 'A confirmação da senha não confere'),
});

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const { signIn } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema),
  });

  async function handleSignUp({ name, email, password }: FormDataProps) {
    setIsLoading(true);
    try {
      await api.post('/users', { name, email, password });
      await signIn(email, password);
    } catch (error) {
      setIsLoading(false);
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });
    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />

        <Center my={24}>
          <LogoSvg />

          <Text color="gray.100" fontSize="sm">
            Treine sua mente e o seu corpo.
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Crie sua conta
          </Heading>

          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="Nome"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirmar a Senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            )}
          />


          <Button title="Criar e acessar" onPress={handleSubmit(handleSignUp)} isLoading={isLoading} />
        </Center>

        <Button
          title="Voltar para o login"
          variant="outline"
          mt={12}
          onPress={handleGoBack}
        />
      </VStack>
    </ScrollView>
  );
}