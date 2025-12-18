package com.talent_tandem.dao;
import com.talent_tandem.model.*;

import java.util.List;
import java.util.Optional;


public interface IUserDao {

     public User createUser(User user);
     public User findByUsername(String username);
     public User findByEmail(String email);
     public User updateUser(User user);
     Optional<User> findById(Long userId);
     User save(User user);
     List<User> findAll();
}
